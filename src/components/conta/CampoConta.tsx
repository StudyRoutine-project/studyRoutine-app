import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { cores } from '../../theme/cores';
import { CampoTexto } from '../CampoTexto';

import type { CampoTextoProps } from '../CampoTexto';

type Props = Omit<CampoTextoProps, 'rotulo' | 'icone' | 'corIcone' | 'acao' | 'secureTextEntry'> & {
  rotulo: string;
  icone: 'mail' | 'lock' | 'user';
  senha?: boolean;
};

export function CampoConta({ senha = false, ...props }: Props) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <CampoTexto
      {...props}
      secureTextEntry={senha && !senhaVisivel}
      acao={
        senha && (
          <Pressable
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            accessibilityRole="button"
            onPress={() => setSenhaVisivel((visivel) => !visivel)}
            style={styles.visibilidade}
          >
            <Feather
              accessible={false}
              aria-hidden
              color={cores.secundario}
              name={senhaVisivel ? 'eye' : 'eye-off'}
              size={20}
            />
          </Pressable>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  visibilidade: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
