import { z } from 'zod';

import { RowsContainerPropsSchema as BaseRowsContainerPropsSchema } from '@usewaypoint/block-rows-container';

const BasePropsShape = BaseRowsContainerPropsSchema.shape.props.unwrap().unwrap().shape;

const RowsContainerPropsSchema = z.object({
  style: BaseRowsContainerPropsSchema.shape.style,
  props: z
    .object({
      ...BasePropsShape,
      rows: z
        .array(z.object({ childrenIds: z.array(z.string()) }))
        .min(2)
        .max(6),
    })
    .optional()
    .nullable(),
});

export type RowsContainerProps = z.infer<typeof RowsContainerPropsSchema>;
export default RowsContainerPropsSchema;
