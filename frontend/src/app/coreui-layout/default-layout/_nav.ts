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
    url: '/admin/boutiques',
    iconComponent: { name: 'cil-building' },
  },
  {
    name: 'Produits',
    url: '/admin/produits',
    iconComponent: { name: 'cil-tags' },
  },
  {
    name: 'Commandes',
    url: '/admin/commandes',
    iconComponent: { name: 'cil-cart' },
  },
  {
    title: true,
    name: 'Utilisateurs',
  },
  {
    name: 'Comptes Clients',
    url: '/admin/utilisateurs',
    iconComponent: { name: 'cil-people' },
  },
  {
    name: 'Paramètres',
    url: '/admin/parametres',
    iconComponent: { name: 'cil-settings' },
  },
];
