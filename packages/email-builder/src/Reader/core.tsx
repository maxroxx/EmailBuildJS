import React, { createContext, useContext } from 'react';
import { z } from 'zod';

import { Avatar, AvatarProps, AvatarPropsSchema, buildAvatarUrl } from '@usewaypoint/block-avatar';
import { Button, ButtonProps, ButtonPropsSchema } from '@usewaypoint/block-button';
import { useAccentColor } from '../AccentColorContext';
import { Divider, DividerPropsSchema } from '@usewaypoint/block-divider';
import { Heading, HeadingPropsSchema } from '@usewaypoint/block-heading';
import { Html, HtmlPropsSchema } from '@usewaypoint/block-html';
import { Image, ImagePropsSchema } from '@usewaypoint/block-image';
import { Spacer, SpacerPropsSchema } from '@usewaypoint/block-spacer';
import { Text, TextPropsSchema } from '@usewaypoint/block-text';
import {
  buildBlockComponent,
  buildBlockConfigurationDictionary,
  buildBlockConfigurationSchema,
} from '@usewaypoint/document-core';

import ColumnsContainerPropsSchema from '../blocks/ColumnsContainer/ColumnsContainerPropsSchema';
import ColumnsContainerReader from '../blocks/ColumnsContainer/ColumnsContainerReader';
import { ContainerPropsSchema } from '../blocks/Container/ContainerPropsSchema';
import ContainerReader from '../blocks/Container/ContainerReader';
import { EmailLayoutPropsSchema } from '../blocks/EmailLayout/EmailLayoutPropsSchema';
import EmailLayoutReader from '../blocks/EmailLayout/EmailLayoutReader';

const ReaderContext = createContext<TReaderDocument>({});

const BUTTON_DEFAULT_COLOR = '#999999';
const AVATAR_DEFAULT_COLOR = '#999999';

function ButtonWithAccentDefault(props: ButtonProps) {
  const accentColor = useAccentColor();
  return (
    <Button
      {...props}
      props={{
        ...props.props,
        buttonBackgroundColor: props.props?.buttonBackgroundColor ?? accentColor ?? BUTTON_DEFAULT_COLOR,
      }}
    />
  );
}

function AvatarWithAccentDefault(props: AvatarProps) {
  const accentColor = useAccentColor();
  const backgroundColor = props.props?.backgroundColor ?? accentColor ?? AVATAR_DEFAULT_COLOR;
  const borderColor = props.props?.borderColor ?? undefined;
  const imageUrl = props.props?.imageUrl || buildAvatarUrl(props.props?.text, backgroundColor);
  return (
    <Avatar
      {...props}
      props={{
        ...props.props,
        imageUrl,
        borderColor,
        backgroundColor,
      }}
    />
  );
}

function useReaderDocument() {
  return useContext(ReaderContext);
}

const READER_DICTIONARY = buildBlockConfigurationDictionary({
  ColumnsContainer: {
    schema: ColumnsContainerPropsSchema,
    Component: ColumnsContainerReader,
  },
  Container: {
    schema: ContainerPropsSchema,
    Component: ContainerReader,
  },
  EmailLayout: {
    schema: EmailLayoutPropsSchema,
    Component: EmailLayoutReader,
  },
  //
  Avatar: {
    schema: AvatarPropsSchema,
    Component: AvatarWithAccentDefault,
  },
  Button: {
    schema: ButtonPropsSchema,
    Component: ButtonWithAccentDefault,
  },
  Divider: {
    schema: DividerPropsSchema,
    Component: Divider,
  },
  Heading: {
    schema: HeadingPropsSchema,
    Component: Heading,
  },
  Html: {
    schema: HtmlPropsSchema,
    Component: Html,
  },
  Image: {
    schema: ImagePropsSchema,
    Component: Image,
  },
  Spacer: {
    schema: SpacerPropsSchema,
    Component: Spacer,
  },
  Text: {
    schema: TextPropsSchema,
    Component: Text,
  },
});

export const ReaderBlockSchema = buildBlockConfigurationSchema(READER_DICTIONARY);
export type TReaderBlock = z.infer<typeof ReaderBlockSchema>;

export const ReaderDocumentSchema = z.record(z.string(), ReaderBlockSchema);
export type TReaderDocument = Record<string, TReaderBlock>;

const BaseReaderBlock = buildBlockComponent(READER_DICTIONARY);

export type TReaderBlockProps = { id: string };
export function ReaderBlock({ id }: TReaderBlockProps) {
  const document = useReaderDocument();
  return <BaseReaderBlock {...document[id]} />;
}

export type TReaderProps = {
  document: Record<string, z.infer<typeof ReaderBlockSchema>>;
  rootBlockId: string;
};
export default function Reader({ document, rootBlockId }: TReaderProps) {
  return (
    <ReaderContext.Provider value={document}>
      <ReaderBlock id={rootBlockId} />
    </ReaderContext.Provider>
  );
}
