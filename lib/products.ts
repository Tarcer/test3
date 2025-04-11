export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  features: string[]
  demoUrl: string
}

export const products: Product[] = [
  {
    id: "template-ecommerce-1",
    name: "E-Boutique Pro",
    description: "Template e-commerce complet avec catalogue produits, panier et processus de paiement.",
    price: 499,
    category: "E-commerce",
    image: "/placeholder.svg?height=400&width=600",
    features: [
      "Catalogue produits",
      "Panier d'achat",
      "Processus de paiement",
      "Comptes utilisateurs",
      "Suivi de commandes",
      "Liste de souhaits",
    ],
    demoUrl: "/demo/eboutique-pro",
  },
  {
    id: "template-blog-1",
    name: "BlogMaster",
    description: "Un template de blog élégant conçu pour les créateurs de contenu et les écrivains.",
    price: 299,
    category: "Blog",
    image: "/placeholder.svg?height=400&width=600",
    features: [
      "Mise en page d'articles",
      "Pages de catégories",
      "Profils d'auteurs",
      "Section commentaires",
      "Inscription à la newsletter",
      "Articles connexes",
    ],
    demoUrl: "/demo/blogmaster",
  },
  {
    id: "template-portfolio-1",
    name: "Portfolio Créatif",
    description: "Présentez votre travail avec ce template de portfolio élégant et minimaliste.",
    price: 349,
    category: "Portfolio",
    image: "/placeholder.svg?height=400&width=600",
    features: [
      "Galerie de projets",
      "Section À propos",
      "Affichage des compétences",
      "Formulaire de contact",
      "Intégration de blog",
      "Liens de médias sociaux",
    ],
    demoUrl: "/demo/portfolio-creatif",
  },
  {
    id: "template-business-1",
    name: "Business Elite",
    description: "Un site professionnel pour entreprises avec design moderne et mise en page responsive.",
    price: 599,
    category: "Business",
    image: "/placeholder.svg?height=400&width=600",
    features: [
      "Design responsive",
      "Formulaire de contact",
      "Page À propos",
      "Section services",
      "Membres de l'équipe",
      "Témoignages",
    ],
    demoUrl: "/demo/business-elite",
  },
  {
    id: "template-ecommerce-2",
    name: "MarketPlace Plus",
    description: "Template pour place de marché multi-vendeurs avec fonctionnalités avancées.",
    price: 799,
    category: "E-commerce",
    image: "/placeholder.svg?height=400&width=600",
    features: [
      "Multi-vendeurs",
      "Commissions personnalisables",
      "Tableau de bord vendeur",
      "Système de notation",
      "Messagerie intégrée",
      "Paiements sécurisés",
    ],
    demoUrl: "/demo/marketplace-plus",
  },
  {
    id: "template-portfolio-2",
    name: "Designer Showcase",
    description: "Mettez en valeur vos travaux de design avec ce template de portfolio visuellement impressionnant.",
    price: 449,
    category: "Portfolio",
    image: "/placeholder.svg?height=400&width=600",
    features: [
      "Présentation de projets",
      "Études de cas",
      "Section CV",
      "Témoignages",
      "Services proposés",
      "Formulaire de contact",
    ],
    demoUrl: "/demo/designer-showcase",
  },
]
