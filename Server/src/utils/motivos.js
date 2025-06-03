const motivoCategorias = {
  'Problema Eléctrico': [
    'Sin Corriente', 'Acometida Cortada', 'Afectado a Corte Programado',
    'Cables Cortados de BT o MT', 'Columna al Caer', 'Falta de Fase',
    'Problemas de Tensión', 'Incendio en LBT/LMT', 'Pilastra Electrificada',
    'Incendio en Puesto de Medición', 'Incendio en SETA', 'Medidor Quemado',
    'Problema con el Alumbrado Público', 'Problema en Acometida',
    'Problema en Puesto de Medición', 'Rama sobre Cable o Acometida',
    'Peligro de Electrocución', 'Transformador Quemado'
  ],
  'Rotura de Artefactos': ['Rotura de Artefactos'],
  'Problema Comercial': [
    'Reclamo de Facturación', 'Hurto de Energia',
    'Reclamo Comercial', 'Otro problema comercial'
  ],
  'Otros': [
    'Alumbrado Público', 'Apertura Distribuidor ET Caucete',
    'Poste Quebrado', 'Falta de Poda', 'Otros'
  ]
};

const todosLosMotivos = Object.values(motivoCategorias).flat();
const submotivosPrincipales = [
  ...motivoCategorias['Problema Eléctrico'],
  ...motivoCategorias['Rotura de Artefactos'],
  ...motivoCategorias['Problema Comercial'],
];

module.exports = {
  motivoCategorias,
  todosLosMotivos,
  submotivosPrincipales,
};