import React, { useState } from 'react';
import { ZodError } from 'zod';
import {
	SpaceBarOutlined,
	VerticalAlignBottomOutlined,
	VerticalAlignCenterOutlined,
	VerticalAlignTopOutlined,
	ViewWeekOutlined,
	TableRowsOutlined,
} from '@mui/icons-material';
import { ToggleButton, Tooltip } from '@mui/material';
import ColumnsContainerPropsSchema, {
	ColumnsContainerProps,
} from '../../../../documents/blocks/ColumnsContainer/ColumnsContainerPropsSchema';
import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import ColumnWidthsInput from './helpers/inputs/ColumnWidthsInput';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import SliderInput from './helpers/inputs/SliderInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';
type ColumnsContainerPanelProps = {
	data: ColumnsContainerProps;
	setData: (v: ColumnsContainerProps) => void;
};
export default function ColumnsContainerPanel({ data, setData }: ColumnsContainerPanelProps) {
	const [, setErrors] = useState<ZodError | null>(null);
	const updateData = (d: unknown) => {
		const res = ColumnsContainerPropsSchema.safeParse(d);
		if (res.success) {
			setData(res.data);
			setErrors(null);
		} else {
			setErrors(res.error);
		}
	};
	return (
		<BaseSidebarPanel title="Columns block">
			<RadioGroupInput
				label="Number of columns"
				defaultValue={data.props?.columnsCount === 2 ? '2' : '3'}
				onChange={(v) => {
					updateData({ ...data, props: { ...data.props, columnsCount: v === '2' ? 2 : 3 } });
				}}
			>
				<ToggleButton value="2">2</ToggleButton>
				<ToggleButton value="3">3</ToggleButton>
			</RadioGroupInput>
			<ColumnWidthsInput
				defaultValue={data.props?.fixedWidths}
				onChange={(fixedWidths) => {
					updateData({ ...data, props: { ...data.props, fixedWidths } });
				}}
			/>
			<RadioGroupInput
				label="Mobile Layout"
				defaultValue={data.props?.stackOnMobile ? 'stack' : 'side-by-side'}
				onChange={(v) => {
					updateData({
						...data,
						props: {
							...data.props,
							stackOnMobile: v === 'stack'
						}
					});
				}}
			>
				<Tooltip title="Keep columns side-by-side on mobile sized devices" placement="bottom">
					<ToggleButton value="side-by-side">
						<ViewWeekOutlined fontSize="small" />
					</ToggleButton>
				</Tooltip>
				<Tooltip title="Stack columns on mobile sized devices" placement="bottom">
					<ToggleButton value="stack">
						<TableRowsOutlined fontSize="small" />
					</ToggleButton>
				</Tooltip>
			</RadioGroupInput>
			<SliderInput
				label="Columns gap"
				iconLabel={<SpaceBarOutlined sx={{ color: 'text.secondary' }} />}
				units="px"
				step={4}
				marks
				min={0}
				max={80}
				defaultValue={data.props?.columnsGap ?? 0}
				onChange={(columnsGap) => updateData({ ...data, props: { ...data.props, columnsGap } })}
			/>
			<RadioGroupInput
				label="Alignment"
				defaultValue={data.props?.contentAlignment ?? 'middle'}
				onChange={(contentAlignment) => {
					updateData({ ...data, props: { ...data.props, contentAlignment } });
				}}
			>
				<ToggleButton value="top">
					<VerticalAlignTopOutlined fontSize="small" />
				</ToggleButton>
				<ToggleButton value="middle">
					<VerticalAlignCenterOutlined fontSize="small" />
				</ToggleButton>
				<ToggleButton value="bottom">
					<VerticalAlignBottomOutlined fontSize="small" />
				</ToggleButton>
			</RadioGroupInput>
			<MultiStylePropertyPanel
				names={['backgroundColor', 'padding']}
				value={data.style}
				onChange={(style) => updateData({ ...data, style })}
			/>
		</BaseSidebarPanel>
	);
}
