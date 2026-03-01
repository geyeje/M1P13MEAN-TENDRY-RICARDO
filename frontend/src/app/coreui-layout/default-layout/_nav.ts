import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/admin/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  },
  {
    title: true,
    name: 'Gestion Marketplace',
  },
  {
    name: 'Boutiques',
    url: '/admin/shops',
    iconComponent: { name: 'cil-building' },
  },
  {
    title: true,
    name: 'Utilisateurs',
  },
  {
    name: 'Comptes Utilisateurs',
    url: '/admin/users',
    iconComponent: { name: 'cil-people' },
  },
];

