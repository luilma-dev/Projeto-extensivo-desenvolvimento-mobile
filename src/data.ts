// Dados fictícios: voltam ao estado inicial quando o aplicativo é recarregado.
export type Vehicle = { id: number; plate: string; model: string; owner: string };
export type Status = 'Aberta' | 'Em andamento' | 'Concluída';
export type Order = {
  id: number;
  vehicleId: number;
  service: string;
  status: Status;
  /** Valores inteiros em centavos evitam erros de arredondamento. */
  totalCents: number;
  costCents: number;
};
export type Tab = 'Início' | 'Frota' | 'Ordens';

export function formatBRL(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export const initialVehicles: Vehicle[] = [
  { id: 1, plate: 'ABC1D23', model: 'Volvo FH 540', owner: 'Transportadora Horizonte' },
  { id: 2, plate: 'DEF4G56', model: 'Scania R 450', owner: 'Carlos Silva' },
  { id: 3, plate: 'HIJ7K89', model: 'Mercedes-Benz Actros', owner: 'Expresso Nordeste' },
];

export const initialOrders: Order[] = [
  { id: 1, vehicleId: 1, service: 'Troca de óleo e filtros', status: 'Em andamento', totalCents: 145000, costCents: 82000 },
  { id: 2, vehicleId: 2, service: 'Revisão dos freios', status: 'Aberta', totalCents: 280000, costCents: 165000 },
  { id: 3, vehicleId: 3, service: 'Alinhamento e balanceamento', status: 'Concluída', totalCents: 65000, costCents: 23000 },
];
