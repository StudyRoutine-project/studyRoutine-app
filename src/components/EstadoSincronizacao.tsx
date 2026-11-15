import {
  ArrowsClockwiseIcon,
  ClockCountdownIcon,
  CloudCheckIcon,
  CloudSlashIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';

import type { EstadoSincronizacao as Estado } from '../hooks/useSincronizacao';

type Props = {
  estado?: Estado;
  sincronizar?: () => void;
  compacto?: boolean;
};

const fases = {
  atualizado: { titulo: 'Dados sincronizados', icone: CloudCheckIcon, cor: cores.sucesso },
  sincronizando: { titulo: 'Sincronizando…', icone: ArrowsClockwiseIcon, cor: cores.roxo },
  offline: { titulo: 'Sem conexão', icone: CloudSlashIcon, cor: cores.aviso },
  pendente: { titulo: 'Aguardando envio', icone: ClockCountdownIcon, cor: cores.aviso },
  erro: { titulo: 'Não foi possível sincronizar', icone: WarningCircleIcon, cor: cores.erro },
};

export function EstadoSincronizacao({ estado, sincronizar, compacto = false }: Props) {
  const pendentes = estado?.pendentes ?? 0;
  const fase = estado?.fase ?? 'sincronizando';
  const envioBloqueado = fase === 'offline' || fase === 'erro';
  if (compacto && (pendentes === 0 || !envioBloqueado)) return null;

  const estadoVisivel = fase === 'atualizado' && pendentes > 0 ? 'pendente' : fase;
  const { titulo, icone: Icone, cor } = fases[estadoVisivel];
  const ocupado = fase === 'sincronizando';
  const quantidade = pendentes === 1 ? '1 alteração pendente' : `${pendentes} alterações pendentes`;
  const mensagemOffline = fase === 'offline'
    ? 'A sincronização será retomada quando a conexão voltar.'
    : undefined;
  const detalhe = compacto
    ? 'Suas alterações estão salvas neste aparelho.'
    : pendentes > 0 ? quantidade : mensagemOffline;
  const corAcao = fase === 'erro' ? cores.erro : cores.roxo;

  return (
    <View style={[styles.conteudo, compacto && styles.resumo]}>
      <View style={styles.status}>
        <View style={[styles.icone, { backgroundColor: `${cor}17` }]}>
          {ocupado
            ? <ActivityIndicator size="small" color={cor} accessible={false} />
            : <Icone size={21} color={cor} weight="bold" aria-hidden />}
        </View>
        <View accessibilityLiveRegion="polite" style={styles.textos}>
          <Text style={styles.titulo}>{titulo}</Text>
          {detalhe && <Text style={styles.detalhe}>{detalhe}</Text>}
        </View>
      </View>

      {!compacto && sincronizar && fase !== 'offline' && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: ocupado, disabled: ocupado }}
          disabled={ocupado}
          onPress={sincronizar}
          style={({ pressed }) => [
            styles.acao,
            { backgroundColor: `${corAcao}${pressed ? '26' : '12'}` },
            ocupado && styles.acaoDesativada,
          ]}
        >
          <ArrowsClockwiseIcon size={17} color={corAcao} weight="bold" aria-hidden />
          <Text style={[styles.acaoTexto, { color: corAcao }]}>
            {fase === 'erro' ? 'Tentar de novo' : 'Sincronizar agora'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    gap: 12,
  },
  resumo: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  detalhe: {
    color: cores.secundario,
    fontSize: 13,
    lineHeight: 18,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  acaoDesativada: {
    opacity: 0.55,
  },
  acaoTexto: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
});
