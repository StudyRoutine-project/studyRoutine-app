import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import { AgendaScreen } from '../screens/AgendaScreen';
import { DisciplinasScreen } from '../screens/DisciplinasScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { cores } from '../theme/cores';

import type { SupabaseClient, User } from '@supabase/supabase-js';

type Rotas = {
  Inicio: undefined;
  Disciplinas: undefined;
  Agenda: undefined;
};

type Props = {
  client: SupabaseClient;
  usuario: User;
  novaDisciplina: () => void;
  abrirDisciplina: (disciplinaId: string) => void;
};

const Tab = createBottomTabNavigator<Rotas>();

const icones = {
  Inicio: 'home',
  Disciplinas: 'book-open',
  Agenda: 'calendar',
} as const;

export function AbasNavigator({ client, usuario, novaDisciplina, abrirDisciplina }: Props) {
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
        {() => <InicioScreen client={client} usuario={usuario} />}
      </Tab.Screen>
      <Tab.Screen name="Disciplinas">
        {() => (
          <DisciplinasScreen
            usuarioId={usuario.id}
            novaDisciplina={novaDisciplina}
            abrirDisciplina={abrirDisciplina}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Agenda" component={AgendaScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barra: { backgroundColor: cores.branco, borderTopColor: cores.borda },
  rotulo: { fontSize: 12, fontWeight: '600' },
});
