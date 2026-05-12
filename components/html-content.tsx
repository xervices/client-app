import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHTML, {
  MixedStyleDeclaration,
  MixedStyleRecord,
} from 'react-native-render-html';

const SCREEN_PADDING = 24;

const baseStyle: MixedStyleDeclaration = {
  color: '#737381',
  fontSize: 14,
  lineHeight: 22,
};

const tagsStyles: MixedStyleRecord = {
  p: {
    color: '#737381',
    marginTop: 0,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 22,
  },
  strong: {
    color: '#1B1B1E',
    fontWeight: '600',
  },
  b: {
    color: '#1B1B1E',
    fontWeight: '600',
  },
  ul: {
    marginTop: 0,
    marginBottom: 12,
    paddingLeft: 20,
  },
  ol: {
    marginTop: 0,
    marginBottom: 12,
    paddingLeft: 20,
  },
  li: {
    color: '#737381',
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 22,
  },
  a: {
    color: '#FE6A00',
    textDecorationLine: 'underline',
  },
  br: {
    height: 8,
  },
};

const renderersProps = {
  ul: { markerBoxStyle: { paddingRight: 6 } },
  ol: { markerBoxStyle: { paddingRight: 6 } },
};

function preprocess(html: string): string {
  return (
    html
      .replace(/\t/g, ' ')
      .replace(/<p>\s*<\/p>/gi, '<p>&nbsp;</p>')
      .trim()
  );
}

interface HtmlContentProps {
  html?: string | null;
  contentPadding?: number;
}

export function HtmlContent({ html, contentPadding = SCREEN_PADDING * 2 }: HtmlContentProps) {
  const { width } = useWindowDimensions();

  const cleaned = React.useMemo(() => (html ? preprocess(html) : ''), [html]);

  const source = React.useMemo(() => ({ html: cleaned }), [cleaned]);

  if (!cleaned) return null;

  return (
    <RenderHTML
      contentWidth={width - contentPadding}
      source={source}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      renderersProps={renderersProps}
      defaultTextProps={{ selectable: true }}
      enableExperimentalMarginCollapsing
    />
  );
}
