import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet } from 'react-native';

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
  abrirDisciplina,
}: Props) {
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
        tabBarStyle: styles.barra,
        tabBarLabelStyle: styles.rotulo,
        tabBarIcon: ({ color, size }) => (
          <Feather name={icones[route.name]} color={color} size={size} aria-hidden />
        ),
      })}
    >
      <Tab.Screen name="Inicio" options={{ title: 'Início' }}>
        {() => <InicioScreen nome={nome} email={email} acaoPerfil={acaoPerfil} />}
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
  barra: { backgroundColor: cores.branco, borderTopColor: cores.borda },
  rotulo: { fontSize: 12, fontWeight: '600' },
  perfil: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  pressionado: { opacity: 0.75 },
});
