import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarIniciais } from '../components/AvatarIniciais';
import { AgendaScreen } from '../screens/AgendaScreen';
import { DisciplinasScreen } from '../screens/DisciplinasScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { cores } from '../theme/cores';

type Rotas = {
  Inicio: undefined;
  Disciplinas: undefined;
  Agenda: undefined;
};

type Props = {
  usuarioId: string;
  nome: string;
  email?: string;
  abrirPerfil: () => void;
  novaDisciplina: () => void;
  novaAtividade: () => void;
  abrirAtividade: (atividadeId: string) => void;
  abrirDisciplina: (disciplinaId: string) => void;
};

const Tab = createBottomTabNavigator<Rotas>();

const icones = {
  Inicio: 'home',
  Disciplinas: 'book-open',
  Agenda: 'calendar',
} as const;

export function AbasNavigator({
  usuarioId,
  nome,
  email,
  abrirPerfil,
  novaDisciplina,
  novaAtividade,
  abrirAtividade,
  abrirDisciplina,
}: Props) {
  const { bottom } = useSafeAreaInsets();
  const acaoPerfil = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir perfil"
      onPress={abrirPerfil}
      style={({ pressed }) => [styles.perfil, pressed && styles.pressionado]}
    >
      <AvatarIniciais nome={nome} email={email} />
    </Pressable>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: cores.roxo,
        tabBarInactiveTintColor: cores.secundario,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [styles.barra, { height: 68 + bottom, paddingBottom: bottom + 8 }],
        tabBarLabelStyle: styles.rotulo,
        tabBarIconStyle: styles.areaIcone,
        tabBarIcon: ({ color, focused }) => (
          <View style={styles.icone}>
            <View style={[styles.indicador, focused && styles.indicadorAtivo]} />
            <Feather name={icones[route.name]} color={color} size={22} aria-hidden />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Inicio" options={{ title: 'Início' }}>
        {() => (
          <InicioScreen
            usuarioId={usuarioId}
            nome={nome}
            acaoPerfil={acaoPerfil}
            novaDisciplina={novaDisciplina}
            novaAtividade={novaAtividade}
            abrirAtividade={abrirAtividade}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Disciplinas">
        {() => (
          <DisciplinasScreen
            usuarioId={usuarioId}
            acaoPerfil={acaoPerfil}
            novaDisciplina={novaDisciplina}
            abrirDisciplina={abrirDisciplina}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Agenda">{() => <AgendaScreen acaoPerfil={acaoPerfil} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barra: { paddingTop: 0, backgroundColor: cores.branco, borderTopColor: cores.borda },
  rotulo: { marginTop: 2, fontSize: 12, fontWeight: '600' },
  areaIcone: { width: 32, height: 32 },
  icone: { alignItems: 'center', paddingTop: 10 },
  indicador: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  indicadorAtivo: { backgroundColor: cores.roxo },
  perfil: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  pressionado: { opacity: 0.75 },
});
