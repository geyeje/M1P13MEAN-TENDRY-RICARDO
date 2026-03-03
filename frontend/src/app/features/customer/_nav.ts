import { INavData } from "@coreui/angular";

export const customerNavItems: INavData[] = [
    {
    name: 'Dashboard',
    url: './dashboard',
    iconComponent: { name: 'cil-speedometer' },
  },
  { name: 'mon panier',
    url: './shopping-cart',
    iconComponent: { name: 'cil-speedometer'}
  },
  { name: 'nos produits',
    url: './product-list',
    iconComponent: { name: ''}
  },
  { name: 'nos boutiques',
    url: './boutiques',
    iconComponent: { name: ''}
  },
  { name: 'historique',
    url: './order-history',
    iconComponent: { name: ''}
  },
  { name: 'commandes',
    url: './order-list',
    iconComponent: { name: 'cil-speedometer'}
  },
  { name: 'Paramètres',
    url: '/customer/profil',
    iconComponent: { name: ''}
  }
];