/**
 * French — the reference dictionary. `ar.ts` and `en.ts` are typed against
 * this shape, so a missing key is a compile error rather than a blank string.
 *
 * This file holds UI chrome only. Catalogue text (product names, descriptions,
 * category labels, banner alt text) lives in `data/content.json` and is edited
 * from the dashboard.
 */
const fr = {
  meta: {
    tagline: "Le soin quotidien, en toute douceur",
    description:
      "Laboratoires Hyprodis — fabrication et distribution de produits de soin personnel en Algérie sous la marque véa : shampooings et après-shampooings, soin bébé et soin intime. Des formules douces, au pH équilibré, testées sous contrôle médical.",
  },

  nav: {
    home: "Accueil",
    products: "Nos produits",
    contact: "Contact",
  },

  a11y: {
    mainNav: "Navigation principale",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    skipToContent: "Aller au contenu",
    homeLink: "Accueil",
    carousel: "Publicités et offres",
    slide: "diapositive",
    prevSlide: "Publicité précédente",
    nextSlide: "Publicité suivante",
    goToSlide: "Aller à la publicité",
    slideStatus: "Publicité {current} sur {total} :",
    categories: "Catégories de produits",
    language: "Changer de langue",
    productImages: "Images du produit",
    showImage: "Afficher l'image {index}",
    breadcrumb: "Fil d'Ariane",
  },

  categoriesHeading: "Découvrez nos catégories de produits",

  units: {
    ml: "ml",
  },

  productsPage: {
    title: "Nos produits",
    subtitle:
      "Shampooings, après-shampooings, soin bébé et soin intime — formulés et fabriqués dans nos laboratoires.",
    empty: "Aucun produit dans cette catégorie pour le moment.",
    all: "Tout voir",
  },

  product: {
    details: "Détails du produit",
    description: "Description",
    range: "Gamme",
    volume: "Contenance",
    back: "Retour aux produits",
    notFound: "Produit introuvable",
  },

  footer: {
    companyName: "Sarl Hyprodis Laboratoires",
    quickLinks: "Liens rapides",
    contact: "Contactez-nous",
    location: "Notre localisation",
    address: "Zone industrielle, Alger, Algérie",
    hours: "Dimanche – Jeudi · 08:30 – 17:00",
    rights: "Tous droits réservés",
  },

  map: {
    hint: "Survolez la carte pour zoomer et naviguer",
    open: "Ouvrir dans Google Maps",
    title: "Localisation de {company} sur la carte",
  },
};

export default fr;

export type Dictionary = typeof fr;
