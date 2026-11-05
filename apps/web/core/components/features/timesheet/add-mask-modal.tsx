import React, { useCallback, useMemo } from 'react';
import { TranslationHooks, useLocale, useTranslations } from 'next-intl';
import { Item, ManageOrMemberComponent, getNestedValue } from '@/core/components/teams/manage-member-component';
import { useTimelogFilterOptions } from '@/core/hooks';
import { clsxm } from '@/core/lib/utils';
import { Modal, modalPrimaryActionClass, modalSecondaryActionClass } from '@/core/components';
import { DialogFieldLabel } from '@/core/components/common/dialog-field-label';
import { BillableSwitch } from '@/core/components/common/billable-switch';
import { ADD_ROW_RECIPE } from '@/core/components/common/surface-recipes';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/core/components/common/select';
import { useCreateTimesheet } from '@/core/hooks/timesheet/use-create-timesheet';
import { toUTC } from '@/core/lib/helpers/index';
import { Clock, Plus, Spinner, Trash } from '@/core/components/icons';
import { Button } from '@/core/components/duplicated-components/_button';
import { controlGroupRecipe, controlRecipe } from '@/core/components/common/input';
import { CustomSelect } from '../../common/multiple-select';
import { TaskNameInfoDisplay } from '../../tasks/task-displays';
import { DatePickerFilter } from '../../pages/timesheet/timesheet-filter-date';
import { ETimeLogType, ETimeLogSource } from '@/core/types/generics/enums/timer';
import { useAtomValue } from 'jotai';
import { activeTeamState, tasksByTeamState } from '@/core/stores';
import { useOrganizationProjectsQuery } from '@/core/hooks/organizations/projects/use-organization-projects-query';
import type { TOrganizationProject } from '@/core/types/schemas/organization/organization-project.schema';

const PICKER_LABEL_CLASS_NAME = 'mb-1.5 text-xs font-medium leading-none text-muted-foreground';

const NOTES_FIELD_CLASS_NAME = 'field-sizing-content max-h-[6lh] min-h-20 w-full resize-none p-3';

const NOTES_MAX_LENGTH = 120;

const EMPTY_SHIFT_TOTAL = '00:00h';

export interface IAddTaskModalProps {
	isOpen: boolean;
	closeModal: () => void;
}

interface Shift {
	startTime: string;
	endTime: string;
	totalHours: string;
	dateFrom: Date | string;
}

interface FormState {
	billableChoice: boolean | null;
	notes: string;
	projectId: string;
	taskId: string;
	employeeId: string;
	shifts: {
		dateFrom: Date;
		startTime: string;
		endTime: string;
	}[];
}

/** Minutes since midnight for a time option such as "01:30:00 PM". */
const convertToMinutesHour = (time: string): number => {
	const [hourMinute, period] = time.split(' ');
	const [hours, minutes] = hourMinute.split(':').map(Number);

	let totalMinutes = (hours % 12) * 60 + minutes;
	if (period === 'PM') totalMinutes += 720;

	return totalMinutes;
};

/**
 * Builds the Date for a picked time on the given day. The picked times are the user's wall-clock
 * times; the Date is serialized to UTC when sent.
 * Returns null when that time does not exist on the day (skipped by a daylight saving change),
 * because the local constructor would silently move it forward.
 */
const createLocalDate = (baseDate: Date, time: string): Date | null => {
	const minutesOfDay = convertToMinutesHour(time);
	const date = new Date(
		baseDate.getFullYear(),
		baseDate.getMonth(),
		baseDate.getDate(),
		Math.floor(minutesOfDay / 60),
		minutesOfDay % 60
	);
	return date.getHours() * 60 + date.getMinutes() === minutesOfDay ? date : null;
};

/**
 * Clears the times of a shift that do not exist on its new day (daylight saving change),
 * so they are picked again instead of being saved as something else.
 */
const clearSkippedTimes = (shift: Shift, day: Date) => {
	const clearStart = !!shift.startTime && !createLocalDate(day, shift.startTime);
	const clearEnd = !!shift.endTime && !createLocalDate(day, shift.endTime);
	if (clearStart) shift.startTime = '';
	if (clearEnd) shift.endTime = '';
	if (clearStart || clearEnd) shift.totalHours = '00:00h';
};

function shiftDateLabelOf(dateFrom: Date | string, locale: string, placeholder: string): string {
	if (!dateFrom) {
		return placeholder;
	}
	const day = new Date(dateFrom);
	const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
	return formatter.format(day);
}

function findProject(projectId: string | null | undefined, projects: TOrganizationProject[]) {
	if (!projectId) {
		return undefined;
	}
	return projects.find((project) => project.id === projectId);
}

/** The project of an entry on this task: the task's own project as it is now, or else the one picked by hand. */
function entryProjectIdOf(task: { projectId?: string | null } | undefined, pickedProjectId: string): string {
	const taskProjectId = task?.projectId;
	if (taskProjectId) {
		return taskProjectId;
	}
	return pickedProjectId;
}

/** The billable value picked by hand, or else the entry's project's own setting. */
function billableOf(billableChoice: boolean | null, project: TOrganizationProject | null): boolean {
	if (billableChoice !== null) {
		return billableChoice;
	}
	return project?.billable === true;
}

/** A task's time goes to the task's own project: when the task has one, it is the only project offered. */
function projectChoicesFor(taskProject: TOrganizationProject | undefined, projects: TOrganizationProject[]) {
	if (taskProject) {
		return [taskProject];
	}
	return projects;
}

export function AddTaskModal({ closeModal, isOpen }: IAddTaskModalProps) {
	const tasks = useAtomValue(tasksByTeamState);
	const { generateTimeOptions } = useTimelogFilterOptions();
	const { organizationProjects, getOrganizationProjectsLoading } = useOrganizationProjectsQuery();

	const activeTeam = useAtomValue(activeTeamState);
	const { createTimesheet, loadingCreateTimesheet } = useCreateTimesheet();

	const timeOptions = generateTimeOptions(5);
	const t = useTranslations();
	const notesId = React.useId();

	const [formState, setFormState] = React.useState({
		notes: '',
		billableChoice: null as boolean | null,
		taskId: '',
		employeeId: '',
		projectId: '',
		shifts: [{ startTime: '', endTime: '', totalHours: EMPTY_SHIFT_TOTAL, dateFrom: new Date() }] as Shift[]
	});

	// The task and the employee come from the active team's lists: when that team changes under the open form
	// (a team switch from another tab), they are cleared instead of being saved with the new team
	const activeTeamId = activeTeam?.id;
	const [formTeamId, setFormTeamId] = React.useState(activeTeamId);
	if (formTeamId !== activeTeamId) {
		setFormTeamId(activeTeamId);
		setFormState((prevState) => ({ ...prevState, taskId: '', employeeId: '' }));
	}

	const updateFormState = useCallback((field: keyof typeof formState, value: any) => {
		setFormState((prevState) => ({
			...prevState,
			[field]: value
		}));
	}, []);

	const projects = useMemo(() => organizationProjects || [], [organizationProjects]);
	const selectedTask = tasks.find((task) => task.id === formState.taskId);
	const taskProject = findProject(selectedTask?.projectId, projects);
	const entryProjectId = entryProjectIdOf(selectedTask, formState.projectId);
	const selectedProject = findProject(entryProjectId, projects) ?? null;
	const isBillable = billableOf(formState.billableChoice, selectedProject);
	// Its billable default is unknown until the entry's project has loaded
	const hasUnloadedProject = Boolean(entryProjectId) && !selectedProject;
	const waitsForProject = hasUnloadedProject && getOrganizationProjectsLoading;
	const isSaveDisabled = loadingCreateTimesheet || waitsForProject;

	const pickTask = useCallback(
		(taskId: string) => {
			const pickedTask = tasks.find((task) => task.id === taskId);
			const pickedTaskProjectId = pickedTask?.projectId;
			if (!pickedTaskProjectId) {
				// Keep the project shown so far, which follows the previous task if it moved meanwhile
				setFormState((prevState) => {
					const previousTask = tasks.find((task) => task.id === prevState.taskId);
					const shownProjectId = entryProjectIdOf(previousTask, prevState.projectId);
					return { ...prevState, taskId, projectId: shownProjectId, billableChoice: null };
				});
				return;
			}
			setFormState((prevState) => ({
				...prevState,
				taskId,
				projectId: pickedTaskProjectId,
				billableChoice: null
			}));
		},
		[tasks]
	);

	const projectItemsLists = useMemo(
		() => ({
			Project: projectChoicesFor(taskProject, projects)
		}),
		[projects, taskProject]
	);

	const handleSelectedValuesChange = useCallback(
		(values: { [key: string]: Item | null }) => {
			if (!values.Project) return;
			updateFormState('projectId', values.Project.id);
		},
		[updateFormState]
	);

	const handleChange = useCallback(
		(field: string, selectedItem: Item | null) => {
			if (!selectedItem) return;
			updateFormState(field as keyof typeof formState, selectedItem.id);
		},
		[updateFormState]
	);

	const itemToString = useCallback(
		(item: Item | null, displayKey: string) => getNestedValue(item, displayKey) || '',
		[]
	);

	const itemToValue = useCallback((item: Item | null, valueKey: string) => getNestedValue(item, valueKey) || '', []);

	const selectedValues = useMemo(
		() => ({
			Project: selectedProject
		}),
		[selectedProject]
	);

	const fields = useMemo(
		() => [
			{
				label: t('common.LINK_TO_PROJECT'),
				placeholder: t('common.SELECT_A_PROJECT'),
				isRequired: true,
				valueKey: 'id',
				displayKey: 'name',
				element: 'Project'
			}
		],
		[t]
	);

	const handleAddTimesheet = async (formState: FormState) => {
		const payload = {
			isBillable,
			description: formState.notes,
			projectId: entryProjectId,
			logType: ETimeLogType.MANUAL as any,
			source: ETimeLogSource.TEAMS as any,
			taskId: formState.taskId,
			employeeId: formState.employeeId,
			organizationTeamId: activeTeam?.id
		};
		try {
			if (!formState.shifts || formState.shifts.length === 0) {
				throw new Error('No shifts provided.');
			}
			// Check every shift before sending any, so an invalid one cannot leave part of the batch saved.
			const entries = formState.shifts.map((shift) => {
				if (!shift.dateFrom || !shift.startTime || !shift.endTime) {
					throw new Error('Incomplete shift data.');
				}
				const baseDate = shift.dateFrom instanceof Date ? shift.dateFrom : new Date(shift.dateFrom);
				const start = createLocalDate(baseDate, shift.startTime);
				const end = createLocalDate(baseDate, shift.endTime);
				if (!start || !end) {
					throw new Error('Picked time does not exist on this date.');
				}
				const startedAt = toUTC(start).toISOString();
				const stoppedAt = toUTC(end).toISOString();
				if (stoppedAt <= startedAt) {
					throw new Error('End time must be after start time.');
				}
				return { start, end };
			});
			await Promise.all(
				entries.map(({ start, end }) =>
					createTimesheet({
						...payload,
						startedAt: start,
						stoppedAt: end,
						taskId: payload.taskId
					})
				)
			);
			closeModal();
		} catch (error) {
			console.error('Failed to create timesheet:', error);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			closeModal={closeModal}
			title={t('common.ADD_TIME_ENTRY')}
			breadcrumb={activeTeam?.name}
			showCloseIcon
			className="w-full max-w-xl"
		>
			<div className="flex w-full flex-col gap-4 text-sm">
				<div className="flex flex-col">
					<DialogFieldLabel isRequired>{t('manualTime.TASK')}</DialogFieldLabel>
					<CustomSelect
						value={formState.taskId}
						onChange={pickTask}
						classNameGroup="h-[40vh]"
						ariaLabel="Task issues"
						className="w-full font-medium"
						options={tasks}
						renderOption={(option) => (
							<div className="flex overflow-y-auto gap-x-2 items-center">
								<TaskNameInfoDisplay
									task={option as any}
									className="min-w-0"
									taskTitleClassName="text-sm text-foreground"
									showSize={true}
									dash
									taskNumberClassName="text-sm text-muted-foreground"
								/>
							</div>
						)}
					/>
				</div>
				<ManageOrMemberComponent
					className="flex flex-col"
					fieldClassName="mb-0"
					labelClassName={PICKER_LABEL_CLASS_NAME}
					classNameTitle="text-xs"
					fields={fields}
					itemsLists={projectItemsLists}
					selectedValues={selectedValues}
					onSelectedValuesChange={handleSelectedValuesChange}
					handleChange={handleChange}
					itemToString={itemToString}
					itemToValue={itemToValue}
				/>
				<div className="flex flex-col">
					<DialogFieldLabel isRequired>{t('manualTime.EMPLOYEE')}</DialogFieldLabel>
					<CustomSelect
						valueKey="employeeId"
						value={formState.employeeId}
						classNameGroup="max-h-[40vh]"
						ariaLabel="Task issues"
						className="w-full font-medium"
						options={activeTeam?.members || []}
						onChange={(value) => {
							updateFormState('employeeId', value);
						}}
						renderOption={(option) => (
							<div className="flex gap-x-2 items-center">
								<img
									className="size-6 rounded-full object-cover hairline-ring ring-border"
									src={option.employee.user.imageUrl}
									alt={option.employee.fullName}
								/>
								<span>{option.employee.fullName}</span>
							</div>
						)}
					/>
				</div>
				<div className="flex flex-col">
					<DialogFieldLabel isRequired>{t('common.DATE_AND_TIME')}</DialogFieldLabel>
					<ShiftList
						setShifts={(e) => updateFormState('shifts', e)}
						shifts={formState.shifts}
						t={t}
						timeOptions={timeOptions}
					/>
				</div>
				<div className="flex flex-col">
					<DialogFieldLabel htmlFor={notesId} isRequired>
						{t('common.NOTES')}
					</DialogFieldLabel>
					<textarea
						id={notesId}
						value={formState.notes}
						onChange={(e) => updateFormState('notes', e.target.value)}
						placeholder={t('modals.manualTime.descriptionPlaceholder')}
						className={clsxm(controlRecipe, NOTES_FIELD_CLASS_NAME)}
						maxLength={NOTES_MAX_LENGTH}
						minLength={0}
						required
					/>
					<div className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
						{formState.notes.length}/{NOTES_MAX_LENGTH}
					</div>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
					<BillableSwitch
						isBillable={isBillable}
						onChange={(checked) => updateFormState('billableChoice', checked)}
						label={t('dashboard.timesheets.BILLABLE')}
					/>
					<div className="ml-auto flex items-center gap-2">
						<Button
							variant="ghost"
							size="default"
							type="button"
							onClick={closeModal}
							className={modalSecondaryActionClass}
						>
							{t('common.CANCEL')}
						</Button>
						<Button
							size="default"
							disabled={isSaveDisabled}
							onClick={() => handleAddTimesheet(formState as any)}
							type="submit"
							className={modalPrimaryActionClass}
						>
							{loadingCreateTimesheet && <Spinner className="animate-spin" />}
							{t('common.SAVE')}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}

interface ShiftTimingSelectProps {
	label: string;
	timeOptions: string[];
	value?: string;
	onChange?: (value: string) => void;
	isTimeDisabled?: (time: string) => boolean;
}

const ShiftTimingSelect = ({ label, timeOptions, onChange, value, isTimeDisabled }: ShiftTimingSelectProps) => (
	<div className={clsxm(controlGroupRecipe, 'h-9 min-w-0 overflow-hidden pl-2.5')}>
		<Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
		<Select onValueChange={onChange} value={value}>
			<SelectTrigger
				aria-label={label}
				className="h-full w-full rounded-none border-transparent bg-transparent pl-2 text-ellipsis tabular-nums shadow-none ring-0 focus-visible:ring-0 dark:bg-transparent"
			>
				<SelectValue placeholder={label} />
			</SelectTrigger>
			<SelectContent className="z-[1001] max-h-60 overflow-y-auto">
				<SelectGroup>
					{timeOptions.map((time) => (
						<SelectItem
							key={time}
							value={time}
							disabled={isTimeDisabled?.(time)}
							className="cursor-pointer tabular-nums"
						>
							{time}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	</div>
);

const ShiftList = ({
	setShifts,
	shifts,
	timeOptions,
	t
}: {
	shifts: Shift[];
	setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
	timeOptions: string[];
	t: TranslationHooks;
}) => {
	const calculateTotalHoursHour = React.useCallback((start: string, end: string): string => {
		if (!start || !end) return '00:00h';
		const startMinutes = convertToMinutesHour(start);
		const endMinutes = convertToMinutesHour(end);
		const totalMinutes = endMinutes >= startMinutes ? endMinutes - startMinutes : 1440 - startMinutes + endMinutes;
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}h`;
	}, []);

	const handleAddShift = () => {
		setShifts([...shifts, { startTime: '', endTime: '', totalHours: EMPTY_SHIFT_TOTAL, dateFrom: new Date() }]);
	};

	const handleRemoveShift = (index: number) => {
		const updatedShifts = shifts.filter((_, i) => i !== index);
		setShifts(updatedShifts);
	};

	const handleShiftChange = (index: number, field: keyof Shift, value: string) => {
		const updatedShifts = [...shifts];
		updatedShifts[index][field] = value;

		if (field === 'dateFrom' && value) {
			clearSkippedTimes(updatedShifts[index], new Date(value));
		}

		if (field === 'startTime' || field === 'endTime') {
			const { startTime, endTime } = updatedShifts[index];

			if (!startTime || !endTime) return;

			if (convertToMinutesHour(startTime) >= convertToMinutesHour(endTime)) {
				return;
			}
			updatedShifts[index].totalHours = calculateTotalHoursHour(startTime, endTime);
			const isOverlapping = shifts.some((shift, i) => {
				if (i === index || !shift.startTime || !shift.endTime) return false;

				const currentStart = convertToMinutesHour(startTime);
				const currentEnd = convertToMinutesHour(endTime);
				const shiftStart = convertToMinutesHour(shift.startTime);
				const shiftEnd = convertToMinutesHour(shift.endTime);
				return (
					(currentStart < shiftEnd && currentEnd > shiftStart) ||
					(currentStart === shiftStart && currentEnd === shiftEnd)
				);
			});

			if (isOverlapping) {
				return;
			}
		}

		setShifts(updatedShifts);
	};

	const hasShifts = shifts.length > 0;

	return (
		<div className="flex flex-col gap-2">
			{hasShifts && (
				<div className="flex flex-col rounded-xl bg-card hairline-ring ring-border hairline-divide-y divide-border">
					{shifts.map((element, index) => (
						<ShiftRow
							key={index}
							t={t}
							value={element}
							index={index}
							onChange={handleShiftChange}
							onRemove={() => handleRemoveShift(index)}
							timeOptions={timeOptions}
						/>
					))}
				</div>
			)}
			<button type="button" onClick={handleAddShift} className={ADD_ROW_RECIPE}>
				<Plus aria-hidden="true" />
				<span>{t('common.ADD_ANOTHER_PERIOD')}</span>
			</button>
		</div>
	);
};

const ShiftRow = ({
	onChange,
	onRemove,
	value,
	index,
	timeOptions,
	t
}: {
	onChange: (index: number, field: keyof Shift, value: string) => void;
	onRemove: () => void;
	value: Shift;
	index: number;
	timeOptions: string[];
	t: TranslationHooks;
}) => {
	const locale = useLocale();
	// Times skipped by a daylight saving change on the picked day cannot be saved as picked.
	const baseDate = value.dateFrom ? new Date(value.dateFrom) : null;
	const isTimeDisabled = (time: string) => baseDate !== null && createLocalDate(baseDate, time) === null;
	const dateLabel = shiftDateLabelOf(value.dateFrom, locale, t('common.SELECT_DATE'));

	return (
		<div className="flex flex-col gap-2 p-3">
			<div className="flex items-center gap-2">
				<div className="min-w-0 flex-1">
					<DatePickerFilter
						label={dateLabel}
						date={value.dateFrom as Date}
						setDate={(value) => onChange(index, 'dateFrom', value as any)}
					/>
				</div>
				<span className="shrink-0 rounded-md bg-foreground/[0.04] px-2 py-1 text-[13px] font-medium tabular-nums text-foreground">
					{value.totalHours}
				</span>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={onRemove}
					aria-label={t('common.REMOVE_PERIOD')}
					className="text-muted-foreground hover:text-destructive-ink"
				>
					<Trash aria-hidden="true" />
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<ShiftTimingSelect
					label={t('manualTime.START_TIME')}
					timeOptions={timeOptions}
					value={value.startTime}
					onChange={(value) => onChange(index, 'startTime', value)}
					isTimeDisabled={isTimeDisabled}
				/>
				<ShiftTimingSelect
					label={t('manualTime.END_TIME')}
					timeOptions={timeOptions}
					value={value.endTime}
					onChange={(value) => onChange(index, 'endTime', value)}
					isTimeDisabled={isTimeDisabled}
				/>
			</div>
		</div>
	);
};
