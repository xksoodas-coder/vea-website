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
    about: "Notre société",
    contact: "Contact",
  },

  a11y: {
    mainNav: "Navigation principale",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    close: "Fermer",
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

  about: {
    title: "Notre société",
    subtitle:
      "Qui nous sommes, ce qui nous guide, et les femmes et les hommes derrière la marque véa.",
    story: "Notre histoire",
    mission: "Notre mission",
    vision: "Notre vision",
    values: "Nos valeurs",
    team: "Notre équipe",
    teamSubtitle: "Les personnes qui font vivre nos laboratoires au quotidien.",
    gallery: "En images",
    gallerySubtitle: "Nos locaux, nos ateliers et nos moments forts.",
    empty:
      "Le contenu de cette page sera publié prochainement.",
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
