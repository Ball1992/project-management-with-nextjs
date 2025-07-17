import { LanguageVariableEditView } from 'src/sections/language-variables/view';

// ----------------------------------------------------------------------

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  const { id } = params;

  return <LanguageVariableEditView id={id} />;
}
