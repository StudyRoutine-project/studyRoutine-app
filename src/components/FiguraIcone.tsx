import Feather from '@expo/vector-icons/Feather';

import type { ComponentProps } from 'react';
import type { Icon } from 'phosphor-react-native';

export type Icone = ComponentProps<typeof Feather>['name'] | Icon;

type Props = { icone: Icone; cor: string; tamanho: number };

export function FiguraIcone({ icone: Phosphor, cor, tamanho }: Props) {
  if (typeof Phosphor === 'string') {
    return <Feather name={Phosphor} color={cor} size={tamanho} aria-hidden />;
  }
  return <Phosphor weight="duotone" color={cor} size={tamanho} aria-hidden />;
}
