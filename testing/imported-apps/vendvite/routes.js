var express = require('express');
var invoiceTools = require('./invoice');

// ── Campagne « 150 portes » — reglages produit.
//    Declares au SCOPE FICHIER et non dans la fabrique de routes : la plateforme
//    reinvoque module.exports a chaque requete, donc tout etat declare a
//    l'interieur repartirait vide et n'etranglerait jamais rien.
var CAMPAGNE_CIBLE = 150;
var CAMPAGNE_PALIER = 150;
var CAMPAGNE_PALIERS_MAX = 8;
var CAMPAGNE_MAX = CAMPAGNE_PALIER * CAMPAGNE_PALIERS_MAX;
var CAMPAGNE_PRIX_CENTS = 159;
var CAMPAGNE_PAR_AN = 1;
var CAMPAGNE_HEURES = 72;
var campagneDerniere = new Map();
var CAMPAGNE_DELAI_MS = 20000;
var CAMPAGNE_RESERVE_MIN = 60;

module.exports = function(services){
  var router = express.Router();
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  var db = services.db;
  var cfg = services.config || {};

  var T = {
    fr: {
      meta_title:"Évaluation gratuite de propriété",
      meta_desc:"Découvrez la valeur réelle de votre maison. Saisissez votre adresse, recevez une fiche visuelle et une évaluation gratuite, sans engagement.",
      topbar_cta:"Évaluation gratuite",
      hero_eyebrow:"Évaluation gratuite · sans engagement",
      hero_title:"Combien vaut votre maison, vraiment ?",
      hero_sub:"Saisissez votre adresse. Nous assemblons la fiche de votre propriété et vous remettons une évaluation juste, appuyée par les ventes réelles de votre secteur.",
      address_label:"Adresse de la propriété",
      address_ph:"Commencez à taper votre adresse…",
      hero_note:"Aucuns frais. Aucune obligation. Réponse sous 24 heures.",
      fiche_label:"Dossier",
      fiche_photo_pending:"Aperçu de la rue",
      fiche_empty:"Votre fiche apparaît ici dès que vous choisissez une adresse.",
      form_name:"Nom complet",
      form_name_ph:"Ex. Marie Tremblay",
      form_email:"Courriel",
      form_email_ph:"vous@exemple.com",
      form_phone:"Téléphone",
      form_phone_ph:"(514) 000-0000",
      form_timeframe:"Échéancier de vente",
      tf_placeholder:"Choisissez…",
      tf_asap:"Dès que possible",
      tf_3:"D'ici 3 mois",
      tf_6:"D'ici 6 mois",
      tf_explore:"J'explore simplement",
      form_submit:"Sceller ma demande",
      form_submitting:"Envoi…",
      success_title:"Votre demande est scellée.",
      success_text:"Votre fiche est enregistrée. Nous préparons votre évaluation et vous joignons sous 24 heures.",
      err_required:"Veuillez indiquer votre nom et une adresse.",
      err_generic:"Un problème est survenu. Veuillez réessayer.",
      stamp_text:"Reçue",
      dir_n:"N",dir_s:"S",dir_e:"E",dir_w:"O",
      proto_eyebrow:"Le protocole",
      proto_title:"Trois gestes. Une évaluation.",
      proto_sub:"De l'adresse à la valeur, un parcours clair et sans pression.",
      step1_t:"L'adresse",
      step1_d:"Saisissez votre adresse ; l'autocomplétion la reconnaît instantanément.",
      step2_t:"L'aperçu",
      step2_d:"Votre fiche s'assemble avec la vue de rue et les coordonnées exactes.",
      step3_t:"L'évaluation",
      step3_d:"Vous scellez la demande ; nous livrons une valeur appuyée par le marché.",
      stats_title:"Les preuves en chiffres",
      stat_homes_label:"Propriétés vendues",
      stat_days_label:"Jours au marché (moy.)",
      stat_days_unit:"jours",
      stat_ratio_label:"Ratio prix vendu / demandé",
      stat_volume_label:"Volume de carrière",
      stat_volume_unit:"M$",
      agent_eyebrow:"L'agent",
      agent_title:"Courtier immobilier",
      agent_credo:"Je ne récolte pas des prospects — je présente des propriétés comme des actifs. Chaque vente commence par une évaluation honnête, appuyée par les chiffres du secteur.",
      agent_remax:"Courtier immobilier agréé · Permis OACIQ.",
      testi_eyebrow:"Ils ont vendu",
      testi_title:"Des dossiers conclus au-dessus des attentes.",
      testi_result_label:"Résultat",
      testi_empty:"Les témoignages arrivent bientôt.",
      journal_eyebrow:"Le journal",
      journal_title:"Notes de marché",
      journal_read:"Lire la note",
      journal_empty:"Aucune note pour le moment.",
      social_eyebrow:"Les réseaux",
      social_title:"Suivez-moi",
      seal_line:"Votre évaluation vous attend.",
      seal_btn:"Obtenir mon évaluation",
      footer_disclaimer:"Chaque agence est une entreprise indépendante et autonome. Courtier immobilier — permis OACIQ.",
      footer_rights:"Tous droits réservés.",
      push_btn:"Activer les alertes de ventes",
      back_home:"Retour à l'accueil",
      exp_eyebrow:"Lien échu",
      exp_title:"Ce lien a expiré.",
      exp_lede:"Par sécurité, chaque lien d'accès est personnel et vit 72 heures. Demandez-en un nouveau et il arrivera dans votre boîte en quelques instants.",
      exp_cta:"Demander un nouveau lien",
      inv_meta_title:"Sur invitation seulement",
      inv_meta_desc:"VendVite confie à un nombre restreint de courtiers une page privée qui transforme une adresse en mandat.",
      inv_eyebrow:"Sur invitation seulement",
      inv_title:"Les meilleurs courtiers ne courent plus après les vendeurs.",
      inv_lede:"VendVite donne aux courtiers les plus stratégiques un système de prospection qui offre d’abord une valeur concrète aux propriétaires. Notre méthode exclusive et ultra-ciblée transforme leur intérêt en mandats — pour faire de vous le courtier incontournable dans les secteurs que vous convoitez.",
      inv_price_amount:"599 $",
      inv_price_term:"par année + taxes",
      inv_price_pitch:"Un investissement qui ouvre de nouveaux horizons de prospection — et peut faire de chaque adresse le début de votre prochain mandat.",
      inv_form_title:"Demander une invitation",
      inv_form_sub:"Cinq renseignements. Rien de plus. Nous vérifions la disponibilité de votre secteur avant de répondre.",
      inv_f_name:"Nom complet",
      inv_f_name_ph:"Ex. Marie Tremblay",
      inv_f_agency:"Agence",
      inv_f_agency_ph:"Le nom de votre agence",
      inv_f_region:"Secteur ou région ciblé",
      inv_f_region_ph:"Ex. Rosemont, Montréal ou les Laurentides",
      inv_f_phone:"Téléphone",
      inv_f_phone_ph:"(514) 000-0000",
      inv_f_email:"Courriel",
      inv_f_email_ph:"vous@exemple.com",
      inv_f_submit:"Demander mon invitation",
      inv_f_sending:"Scellement en cours…",
      inv_f_sent:"Candidature scellée",
      inv_fineprint:"Aucun engagement à cette étape. Votre invitation vous donne accès à votre page, que vous pourrez bâtir avant toute activation.",
      inv_done_kicker:"Candidature reçue · Cercle privé",
      inv_done_title:"Votre candidature porte le sceau VendVite.",
      inv_done_text:"Notre comité vérifie maintenant si une licence additionnelle peut être ouverte dans votre secteur. Si oui, votre offre d’accès privée arrivera par courriel — avec une longueur d’avance pour en devenir la référence.",
      inv_done_status:"Disponibilité territoriale en cours de vérification",
      inv_mark_1:"Une page privée, à votre nom et à vos couleurs.",
      inv_mark_2:"Chaque adresse saisie devient un lead qualifié.",
      inv_mark_3:"Les leads vous parviennent instantanément, à vous seul.",
      inv_foot:"Places limitées · Sur invitation seulement",
      inv_err_required:"Tous les champs sont requis.",
      inv_err_email:"Ce courriel semble invalide.",
      inv_err_generic:"Un problème est survenu. Veuillez réessayer.",
      inv_err_dup:"Une invitation a déjà été envoyée à ce courriel. Vérifiez votre boîte de réception.",
      esp_nav_my_page:"Ma page",
      esp_nav_targeted_mail:"Courrier ciblé",
      esp_nav_my_leads:"Mes leads",
      esp_nav_subscription:"Abonnement",
      esp_page_in_progress_status:"Page en préparation.",
      esp_preview_button:"Aperçu",
      esp_launch_eyebrow:"Votre moteur de prospection privé",
      esp_launch_title:"Votre prochaine inscription peut commencer par une simple adresse.",
      esp_launch_body:"Mettez-y votre touche. Puis visez votre première campagne postale — elle est comprise dans votre licence : 150 lettres, ou davantage, dans le quartier que vous voulez dominer.",
      esp_launch_offer:"Licence VendVite annuelle",
      esp_launch_total:"Total avec taxes",
      esp_launch_cta:"Voir l’offre et activer",
      esp_setup_eyebrow:"Étape 1 · Votre vitrine",
      esp_setup_title:"Faites de cette page la vôtre.",
      esp_setup_body:"Commencez par votre identité et votre promesse. Vous pouvez enregistrer, prévisualiser et revenir modifier chaque détail avant l’activation.",
      esp_section_your_identity:"Votre identité",
      esp_no_photo_placeholder:"Aucune photo",
      esp_upload_photo_button:"Téléverser une photo",
      esp_photo_format_size_hint:"JPG, PNG ou WebP · 8&nbsp;Mo max",
      esp_portrait_field_help:"Votre portrait — affiché dans la section «&nbsp;Votre courtier&nbsp;» de votre page et comme image de partage sur les réseaux sociaux.",
      esp_display_name_label:"Nom affiché",
      esp_display_name_help:"Votre nom tel qu'il apparaît partout&nbsp;: barre du haut, section courtier, pied de page.",
      esp_title_label:"Titre",
      esp_title_help:"Votre titre professionnel, sous votre nom dans la section courtier. Vide = «&nbsp; &nbsp;».",
      esp_agency_label:"Agence",
      esp_agency_help:"Le nom de votre agence, affiché sous votre titre dans la section courtier.",
      esp_phone_label:"Téléphone",
      esp_phone_help:"Bouton d'appel dans la barre du haut de votre page.",
      esp_email_label:"Courriel",
      esp_email_help:"C'est ici que chaque nouveau lead vous est envoyé — jamais affiché publiquement.",
      esp_section_about_you:"À propos de vous",
      esp_bio_label:"Votre présentation",
      esp_bio_help:"Le paragraphe de la section «&nbsp;L'agent&nbsp;» de votre page — votre philosophie, votre approche, en une ou deux phrases. Videz-le et le texte par défaut revient.",
      esp_section_your_hook:"Votre accroche",
      esp_main_headline_label:"Titre principal",
      esp_main_headline_help:"Le grand titre en haut de votre page. Videz-le et le texte par défaut revient.",
      esp_subtitle_label:"Sous-titre",
      esp_subtitle_help:"Le paragraphe sous le titre — votre promesse au vendeur. Videz-le et le texte par défaut revient.",
      esp_note_under_field_label:"Note sous le champ",
      esp_note_under_field_help:"La ligne rassurante sous le champ d'adresse (frais, délai de réponse…). Videz-le et le texte par défaut revient.",
      esp_section_your_numbers:"Vos chiffres",
      esp_stats_shown_in_proof_section:"Affichés dans la section «&nbsp;Les preuves en chiffres&nbsp;». Un champ vide garde la valeur du modèle.",
      esp_stat_properties_sold_label:"Propriétés vendues",
      esp_stat_properties_sold_help:"Nombre total de propriétés que vous avez vendues.",
      esp_stat_days_on_market_label:"Jours au marché",
      esp_stat_days_on_market_help:"Durée moyenne avant vente, en jours.",
      esp_stat_sold_to_list_ratio_label:"Ratio vendu/demandé",
      esp_stat_sold_to_list_ratio_help:"Prix vendu vs prix demandé, en % (le «&nbsp;%&nbsp;» s'ajoute tout seul).",
      esp_stat_volume_millions_label:"Volume (M$)",
      esp_stat_volume_millions_help:"Volume de carrière en millions de dollars (le «&nbsp;M$&nbsp;» s'ajoute tout seul).",
      esp_your_links_heading:"Vos liens",
      esp_links_icons_vs_buttons_help:"Facebook, Instagram, LinkedIn, YouTube et TikTok deviennent des icônes au pied de page&nbsp;; les autres liens (site d'agence, fiche Centris…) s'affichent en boutons. Aucun lien = rien n'apparaît.",
      esp_add_link_button:"+ Ajouter un lien",
      esp_your_testimonials_heading:"Vos témoignages",
      esp_testimonials_default_help:"Laissez vide pour afficher les témoignages par défaut de la page.",
      esp_add_testimonial_button:"+ Ajouter un témoignage",
      esp_save_button:"Enregistrer",
      esp_campaign_included_canada_post:"Inclus dans votre licence · Postes Canada",
      esp_campaign_name_street_tagline:"Désignez une rue. Nous ciblons les portes les plus proches.",
      esp_campaign_territory_explainer:"Vous entrez une adresse&nbsp;; nous dessinons le territoire autour d'elle et sortons les adresses civiques les plus proches — voisins immédiats de votre inscription, de votre dernière vente, du secteur que vous voulez posséder. Chaque lettre porte votre nom, votre agence et un code QR qui mène à votre page.",
      esp_doors_included_unit:"portes incluses",
      esp_hours_before_drop_unit:"avant le dépôt",
      esp_price_per_tier_after_unit:"par palier ensuite",
      esp_this_year_suffix:"cette année",
      esp_letter_preview_alt:"Aperçu de votre lettre",
      esp_letter_mailbox_heading:"Ce qu'on met dans l'enveloppe",
      esp_letter_as_printed_line:"Votre lettre, telle qu'elle sera imprimée.",
      esp_letter_spec_before_page_url:"Noir et blanc, une page recto-verso français/anglais, prête pour Postes Canada. Votre nom, votre agence, vos coordonnées et un code QR unique vers",
      esp_letter_spec_after_page_url:". C'est exactement ce document que reçoivent vos cibles, quel que soit le nombre de portes choisi — l'aperçu ci-contre est la pièce elle-même, pas une maquette.",
      esp_letter_open_print:"Ouvrir en grand et imprimer",
      esp_activate_sub_then_publish_qr:"Activez votre abonnement, puis publiez votre page&nbsp;: le code QR doit mener quelque part.",
      esp_publish_before_letter_notice:"Publiez votre page avant de distribuer la lettre afin que le code QR soit actif.",
      esp_subscription_required_badge:"Abonnement requis",
      esp_included_campaign_activate_note:"Votre campagne de adresses est comprise dans la licence annuelle. Activez-la pour l'utiliser.",
      esp_view_subscription_link:"Voir l'abonnement",
      esp_publish_page_first_title:"Publiez votre page d'abord",
      esp_qr_needs_live_page_warning:"Le code QR imprimé sur chaque lettre doit mener à une page en ligne, sinon la campagne part dans le vide.",
      esp_back_to_my_page:"Retour à ma page",
      esp_how_many_doors_question:"Combien de portes&nbsp;?",
      esp_remove_tier_button:"Retirer un palier",
      esp_add_tier_button:"Ajouter un palier",
      esp_tier_step_included_doors_note:"Par paliers de . Vos portes incluses se déduisent de",
      esp_deducted_from_any:"n'importe quelle",
      esp_area_centre_address_label:"L'adresse au cœur du secteur que vous voulez travailler",
      esp_civic_address_example_ph:"Ex.&nbsp;: 1088 rue de Chambord, Saint-Jérôme",
      esp_address_autocomplete_hint:"Commencez à taper&nbsp;: choisissez l'adresse dans la liste pour un point exact. C'est de là que partent les plus proches voisins.",
      esp_see_my_territory_button:"Voir mon territoire",
      esp_stat_addresses_selected:"adresses retenues",
      esp_stat_farthest_address:"la plus éloignée",
      esp_stat_total_swept:"balayées au total",
      esp_territory_centre_label:"Centre du territoire&nbsp;:",
      esp_view_selected_addresses_link:"Voir les adresses retenues",
      esp_team_note_optional_label:"Une précision pour notre équipe&nbsp;? (facultatif)",
      esp_team_note_placeholder:"Ex.&nbsp;: éviter les tours à condos, viser les unifamiliales…",
      esp_after_confirm_we_take_over:"Dès votre confirmation, nous prenons le relais.",
      esp_fulfilment_steps_lead:"Nous validons la liste, complétons les codes postaux, imprimons vos lettres et les déposons à Postes Canada",
      esp_within_business_hours:"sous &nbsp;heures ouvrables",
      esp_nothing_else_to_do_tail:". Vous n'avez rien d'autre à faire.",
      esp_paypal_test_mode_notice:"Mode test PayPal actif&nbsp;: un achat de palier supplémentaire ne prélève aucun argent réel et sera identifié comme un essai.",
      esp_confirm_launch_mailing_btn:"Confirmer et lancer l'envoi",
      esp_address_source_manual_check:"Les adresses proviennent des données cartographiques publiques. Nous validons chaque liste à la main avant impression&nbsp;; un numéro inexistant est retiré sans vous être facturé.",
      esp_your_campaigns_heading:"Vos campagnes",
      esp_no_campaigns_first_included:"Aucune campagne pour l'instant. La première est comprise dans votre licence.",
      esp_campaign_col_status:"État",
      esp_campaign_col_territory:"Territoire",
      esp_campaign_col_doors:"Portes",
      esp_campaign_col_amount:"Montant",
      esp_campaign_col_date:"Date",
      esp_territory_reload_btn:"Recharger ce territoire",
      esp_cancel_reclaim_included_btn:"Annuler et récupérer ma campagne incluse",
      esp_leads_total_label:"Leads au total",
      esp_leads_new_label:"Nouveaux",
      esp_leads_last_30_days_label:"30 derniers jours",
      esp_leads_empty_state:"Aucun lead pour l'instant.",
      esp_lead_private_notes_ph:"Notes privées…",
      esp_paypal_test_success_title:"Test PayPal réussi. Votre accès d’essai est ouvert.",
      esp_paypal_test_success_body:"Aucun paiement réel. Vous pouvez maintenant publier votre page, tester le code QR, recevoir un lead et demander une campagne ciblée.",
      esp_payment_confirmed_licence_active:"Paiement confirmé. Votre licence est active.",
      esp_invoice_available_emailed:"Votre facture VendVite est disponible ci-dessous et une copie vous est envoyée par courriel.",
      esp_annual_membership_heading:"Adhésion annuelle",
      esp_paypal_test_mode_badge:"MODE TEST PAYPAL",
      esp_test_account_only_note:"Compte sandbox seulement · aucun argent réel · accès d’essai isolé",
      esp_invoice_line_membership:"Adhésion",
      esp_invoice_line_gst:"TPS (5&nbsp;%)",
      esp_invoice_line_qst:"TVQ (9,975&nbsp;%)",
      esp_invoice_line_total:"Total",
      esp_test_access_active_title:"Accès test actif",
      esp_test_access_until_date:"Parcours complet disponible jusqu’au , uniquement en mode sandbox.",
      esp_test_actions_not_a_sale:"La publication, les leads et les demandes de campagne sont des essais clairement identifiés et ne comptent pas comme une vente.",
      esp_renewal_cancelled_title:"Renouvellement annulé",
      esp_page_online_until_date:"Votre page reste en ligne jusqu'au .",
      esp_reactivate_btn:"Réactiver",
      esp_subscription_active_title:"Abonnement actif",
      esp_renews_on_date:"Renouvellement le .",
      esp_cancel_renewal_btn:"Annuler le renouvellement",
      esp_real_subscription_protected_test:"Votre abonnement réel est protégé pendant les essais sandbox. Repassez en mode réel pour gérer son renouvellement.",
      esp_paypal_secure_cancel_anytime:"Paiement sécurisé par PayPal. Annulable en tout temps.",
      esp_perk_private_page_named:"Votre page privée, à votre nom, sur vendvite.app",
      esp_perk_unlimited_valuation_capture:"Capture illimitée de demandes d'évaluation",
      esp_perk_instant_lead_email_alert:"Alerte courriel instantanée à chaque lead",
      esp_perk_private_lead_register:"Votre registre de leads, à vous seul",
      esp_perk_free_edits_anytime:"Modifications en tout temps, sans frais",
      esp_invoices_heading:"Mes factures",
      esp_social_link_label_placeholder:"Libellé (ex. Instagram)",
      esp_save_success_toast:"Enregistré ✓",
      esp_save_failed_toast:"Échec de l’enregistrement",
      esp_photo_too_large_error:"Image trop lourde (8 Mo max).",
      esp_uploading_status:"Téléversement…",
      esp_photo_updated_toast:"Photo mise à jour ✓",
      esp_upload_refused_error:"Téléversement refusé.",
      esp_payment_not_open_contact_us:"Le paiement n’est pas encore ouvert. Écrivez-nous et nous activons votre page manuellement.",
      esp_payment_open_failed_retry:"Impossible d’ouvrir le paiement. Réessayez dans un instant.",
      esp_payment_open_failed:"Impossible d’ouvrir le paiement.",
      esp_confirm_cancellation_button:"Confirmer l’annulation",
      esp_map_service_busy_retry_prefix:"Le service cartographique est occupé — nouvelle tentative (",
      esp_sweep_resume_prefix:"Reprise du balayage déjà effectué sur ",
      esp_sweep_area_start_prefix:"Balayage du secteur sur ",
      esp_territory_restored_prefix:"Territoire restauré — ",
      esp_territory_restored_suffix:" adresses, aucun nouveau balayage nécessaire.",
      esp_area_centre_address_hint:"Entrez l’adresse au cœur du secteur que vous voulez travailler.",
      esp_locating_short_status:"Repérage…",
      esp_locating_address_status:"Localisation de l’adresse…",
      esp_osm_area_uncovered_error:"OpenStreetMap ne couvre pas encore ce secteur. Écrivez-nous : nous constituons la liste à la main.",
      esp_map_service_no_response_error:"Le service cartographique n’a pas répondu. Réessayez dans un instant.",
      esp_campaign_price_included_html:"<span class=\"camp-prix-n\">Incluse</span><span class=\"camp-prix-l\">comprise dans votre licence</span>",
      esp_qty_included_plus_prefix:" offertes + ",
      esp_qty_letters_separator:" lettres · ",
      esp_confirm_launch_mailing_btn_js:"Confirmer et lancer l’envoi",
      esp_payment_not_configured_manual:"Le paiement n’est pas encore configuré. Écrivez-nous et nous lançons la campagne manuellement.",
      esp_opening_paypal:"Ouverture de PayPal…",
      esp_only_found_count_prefix:"Nous n’avons trouvé que ",
      esp_addresses_of_requested_mid:" adresses pour ",
      esp_reduce_qty_or_denser_area:" demandées. Réduisez la quantité ou choisissez un secteur plus dense.",
      esp_invalid_qty_choose_tier:"Quantité invalide. Choisissez un palier de ",
      esp_order_covered_by_included:"Cette commande est entièrement couverte par votre campagne incluse — aucun paiement requis.",
      esp_included_campaign_used_elsewhere:"Votre campagne incluse vient d’être utilisée ailleurs. Rechargez la page pour voir le prix à jour.",
      esp_publish_page_before_qr:"Publiez d’abord votre page : le code QR de la lettre doit mener quelque part.",
      esp_activate_subscription_first:"Activez votre abonnement pour lancer une campagne.",
      esp_session_expired_reopen_link:"Votre session a expiré. Rouvrez votre lien d’accès personnel.",
      esp_launch_success_prefix:"C’est parti ✓ Vos ",
      esp_letters_at_canada_post_by:" lettres sont déposées à Postes Canada d’ici le ",
      esp_campaign_confirmed:"Campagne confirmée",
      esp_yearly_included_already_used:"Votre campagne incluse de l’année est déjà utilisée. Écrivez-nous pour en ajouter une.",
      esp_previous_request_still_processing:"Un instant — votre demande précédente est encore en traitement.",
      esp_confirmation_failed_retry:"La confirmation n’a pas abouti. Réessayez dans un instant.",
      esp_territory_reloaded_prefix:"Territoire rechargé — ",
      esp_addresses_adjust_or_relaunch:" adresses, ajustez la quantité ou relancez.",
      esp_campaign_no_longer_editable:"Cette campagne ne peut plus être modifiée.",
      esp_cancel_reclaim_included_btn_js:"Annuler et récupérer ma campagne incluse",
      esp_test_payment_accepted:"Paiement test accepté ✓ Aucun montant réel n’a été prélevé. La campagne est enregistrée et identifiée comme un essai.",
      esp_payment_received_72_business_h:"Paiement reçu ✓ Vos lettres sont déposées à Postes Canada dans les 72 heures ouvrables.",
      esp_payment_cancelled_included_back:"Paiement annulé. Votre campagne incluse vous est rendue — relancez quand vous voulez.",
      esp_order_cancelled_included_free:"Commande annulée ✓ Votre campagne incluse est de nouveau disponible.",
      esp_paypal_confirmation_pending:"Nous n’avons pas encore reçu la confirmation de PayPal. Elle arrive parfois avec un léger délai ; votre campagne apparaîtra dans l’historique.",
      ltr_title_prefix:"Lettre aux propriétaires — ",
      ltr_printbar_meta:"Lettre personnalisée · Noir et blanc · Format Lettre",
      ltr_print_button:"Imprimer ou enregistrer en PDF",
      ltr_eyebrow_attention:"À l’attention du propriétaire",
      ltr_headline:"Et si vous connaissiez la valeur actuelle de votre propriété&nbsp;?",
      ltr_salutation:"Bonjour,",
      ltr_body_assets:"Votre propriété est probablement l’un de vos actifs les plus importants. Pourtant, sa valeur réelle évolue avec les ventes récentes de votre secteur — souvent bien différemment de l’évaluation municipale.",
      ltr_offer_lead:"Je vous offre une",
      ltr_offer_bold:"évaluation gratuite et sans engagement",
      ltr_offer_tail:". Vous n’avez pas besoin de vouloir vendre aujourd’hui. Connaître votre position sur le marché est simplement une information utile à conserver, maintenant comme plus tard.",
      ltr_reasons_aria:"Pourquoi demander une évaluation",
      ltr_reason1_title:"Pour planifier",
      ltr_reason1_body:"Une vente éventuelle, un refinancement ou votre prochain projet.",
      ltr_reason2_title:"Pour décider",
      ltr_reason2_body:"Des rénovations à prioriser selon la réalité de votre marché.",
      ltr_reason3_title:"Pour savoir",
      ltr_reason3_body:"Ce que les ventes récentes disent vraiment de votre propriété.",
      ltr_body_scan:"Aucune pression, aucun engagement. Scannez simplement le code ci-dessous, entrez votre adresse et votre dossier commencera à prendre forme. Je pourrai ensuite préparer une estimation appuyée par les données de votre secteur.",
      ltr_cta_kicker:"Votre évaluation vous attend",
      ltr_cta_title:"Scannez. Entrez votre adresse. Découvrez votre potentiel.",
      ltr_cta_terms:"Gratuit · Confidentiel · Sans engagement",
      ltr_qr_alt:"Code QR vers la page d’évaluation de ",
      ltr_pullquote:"Une bonne information aujourd’hui peut devenir une excellente décision demain.",
      ltr_fineprint:"Cette offre est gratuite et sans obligation de vendre ou de retenir les services du courtier. L’estimation fournie est une opinion de valeur marchande et ne remplace pas une évaluation agréée. Chaque agence immobilière est une entreprise indépendante et autonome.",
      bp_preview_banner:"Aperçu privé — cette page n'est pas encore publique.",
      bp_preview_back:"Retour à mon espace",
      esp_title_help_lead:"Votre titre professionnel, sous votre nom dans la section courtier. Vide = «&nbsp;",
      esp_title_help_tail:"&nbsp;».",
      esp_lock_membership_lead:"Votre campagne de ",
      esp_lock_membership_tail:" adresses est comprise dans la licence annuelle. Activez-la pour l'utiliser.",
      esp_tiers_of_lead:"Par paliers de ",
      esp_tiers_of_tail:".",
      esp_credit_applies_lead:"Vos ",
      esp_credit_applies_mid:" portes incluses se déduisent de",
      esp_within_hours_lead:"sous ",
      esp_within_hours_tail:"&nbsp;heures ouvrables",
      esp_sandbox_until_lead:"Parcours complet disponible jusqu’au ",
      esp_sandbox_until_tail:", uniquement en mode sandbox.",
      esp_page_online_until_lead:"Votre page reste en ligne jusqu'au ",
      esp_page_online_until_tail:".",
      esp_renews_on_lead:"Renouvellement le ",
      esp_renews_on_tail:".",
      agent_fallback_name:"Votre courtier",
      esp_disclaimer_label:"Mention légale de votre agence",
      esp_disclaimer_help:"La ligne au bas de votre page. Chaque bannière a la sienne — inscrivez celle de votre agence. Vide = mention générique.",
      esp_disclaimer_ph:"Ex. Franchisé indépendant et autonome de …",
      esp_tm_author_ph:"Nom",
      esp_tm_area_ph:"Secteur",
      esp_tm_quote_ph:"Témoignage",
      esp_tm_result_ph:"Résultat",
      esp_qty_at_price:" à ",
      esp_plus_taxes:" + taxes",
      esp_test_page_live:"Votre page test est en ligne.",
      esp_page_live:"Votre page est en ligne.",
      esp_campaigns_included_plural:"campagnes incluses",
      esp_campaign_included_singular:"campagne incluse",
      esp_leads_empty_unpublished:"Publiez votre page pour commencer à recevoir des demandes d'évaluation.",
      esp_leads_empty_published:"Votre page est en ligne. Les demandes apparaîtront ici et vous serez averti par courriel.",
      esp_credit_rest_lead:" taille de commande&nbsp;; le reste est à ",
      esp_credit_rest_tail:"&nbsp;$ la lettre, taxes en sus.",
      esp_per_letter_taxes_extra:"&nbsp;$ la lettre, taxes en sus.",
    },
    en: {
      meta_title:"Free home valuation",
      meta_desc:"Find out what your home is really worth. Enter your address, get a visual property dossier and a free, no-obligation valuation.",
      topbar_cta:"Free valuation",
      hero_eyebrow:"Free valuation · no obligation",
      hero_title:"What is your home really worth?",
      hero_sub:"Type your address. We assemble your property dossier and give you a fair valuation, backed by real sales in your area.",
      address_label:"Property address",
      address_ph:"Start typing your address…",
      hero_note:"No fees. No obligation. A reply within 24 hours.",
      fiche_label:"Dossier",
      fiche_photo_pending:"Street preview",
      fiche_empty:"Your dossier appears here as soon as you choose an address.",
      form_name:"Full name",
      form_name_ph:"e.g. Marie Tremblay",
      form_email:"Email",
      form_email_ph:"you@example.com",
      form_phone:"Phone",
      form_phone_ph:"(514) 000-0000",
      form_timeframe:"Selling timeframe",
      tf_placeholder:"Choose…",
      tf_asap:"As soon as possible",
      tf_3:"Within 3 months",
      tf_6:"Within 6 months",
      tf_explore:"Just exploring",
      form_submit:"Seal my request",
      form_submitting:"Sending…",
      success_title:"Your request is sealed.",
      success_text:"Your dossier is saved. We are preparing your valuation and will reach you within 24 hours.",
      err_required:"Please enter your name and an address.",
      err_generic:"Something went wrong. Please try again.",
      stamp_text:"Received",
      dir_n:"N",dir_s:"S",dir_e:"E",dir_w:"W",
      proto_eyebrow:"The protocol",
      proto_title:"Three moves. One valuation.",
      proto_sub:"From address to value — a clear path, with no pressure.",
      step1_t:"The address",
      step1_d:"Type your address; autocomplete recognises it instantly.",
      step2_t:"The preview",
      step2_d:"Your dossier assembles with the street view and exact coordinates.",
      step3_t:"The valuation",
      step3_d:"You seal the request; we deliver a market-backed value.",
      stats_title:"The proof, in numbers",
      stat_homes_label:"Properties sold",
      stat_days_label:"Days on market (avg.)",
      stat_days_unit:"days",
      stat_ratio_label:"Sold-to-list price ratio",
      stat_volume_label:"Career volume",
      stat_volume_unit:"M$",
      agent_eyebrow:"The agent",
      agent_title:"Real estate broker",
      agent_credo:"I don't harvest leads — I present homes as assets. Every sale begins with an honest valuation, backed by the numbers of your area.",
      agent_remax:"Licensed real estate broker · OACIQ licence.",
      testi_eyebrow:"They sold",
      testi_title:"Files that closed above expectations.",
      testi_result_label:"Result",
      testi_empty:"Testimonials are coming soon.",
      journal_eyebrow:"The journal",
      journal_title:"Market notes",
      journal_read:"Read the note",
      journal_empty:"No notes yet.",
      social_eyebrow:"Social",
      social_title:"Follow me",
      seal_line:"Your valuation is waiting.",
      seal_btn:"Get my valuation",
      footer_disclaimer:"Each agency is independently owned and operated. Real estate broker — OACIQ licence.",
      footer_rights:"All rights reserved.",
      push_btn:"Enable sales alerts",
      back_home:"Back to home",
      exp_eyebrow:"Link expired",
      exp_title:"This link has expired.",
      exp_lede:"For safety, every access link is personal and lives 72 hours. Request a new one and it lands in your inbox within moments.",
      exp_cta:"Request a new link",
      inv_meta_title:"By invitation only",
      inv_meta_desc:"VendVite gives a small circle of brokers a private page that turns an address into a signed mandate.",
      inv_eyebrow:"By invitation only",
      inv_title:"The best brokers stopped chasing sellers.",
      inv_lede:"VendVite hands a restricted circle of brokers a private page that turns a simple address into a signed mandate. Leave your details. If your territory is still open, your invitation follows.",
      inv_price_amount:"$599",
      inv_price_term:"per year + taxes",
      inv_price_pitch:"One investment that opens new prospecting horizons — and can make every address the beginning of your next mandate.",
      inv_form_title:"Request an invitation",
      inv_form_sub:"Five details. Nothing more. We check your territory before replying.",
      inv_f_name:"Full name",
      inv_f_name_ph:"e.g. Marie Tremblay",
      inv_f_agency:"Agency",
      inv_f_agency_ph:"Your agency name",
      inv_f_region:"Target area or region",
      inv_f_region_ph:"e.g. Rosemont, Montréal or the Laurentians",
      inv_f_phone:"Phone",
      inv_f_phone_ph:"(514) 000-0000",
      inv_f_email:"Email",
      inv_f_email_ph:"you@example.com",
      inv_f_submit:"Request my invitation",
      inv_f_sending:"Sealing your request…",
      inv_f_sent:"Application sealed",
      inv_fineprint:"No commitment at this stage. Your invitation unlocks your page, which you can build before any activation.",
      inv_done_kicker:"Application received · Private circle",
      inv_done_title:"Your application now bears the VendVite seal.",
      inv_done_text:"Our committee is now checking whether an additional licence can be opened in your territory. If so, your private access offer will arrive by email — giving you a head start on becoming its go-to broker.",
      inv_done_status:"Territorial availability now under review",
      inv_mark_1:"A private page, in your name and your colours.",
      inv_mark_2:"Every address entered becomes a qualified lead.",
      inv_mark_3:"Leads reach you instantly, and you alone.",
      inv_foot:"Limited seats · Invite only",
      inv_err_required:"All fields are required.",
      inv_err_email:"That email looks invalid.",
      inv_err_generic:"Something went wrong. Please try again.",
      inv_err_dup:"An invitation was already sent to this email. Check your inbox.",
      esp_nav_my_page:"My page",
      esp_nav_targeted_mail:"Targeted mail",
      esp_nav_my_leads:"My leads",
      esp_nav_subscription:"Subscription",
      esp_page_in_progress_status:"Page in progress.",
      esp_preview_button:"Preview",
      esp_launch_eyebrow:"Your private prospecting engine",
      esp_launch_title:"Your next listing can begin with a single address.",
      esp_launch_body:"Make it yours. Then aim your first mail campaign — it comes with your licence: 150 letters, or more, into the neighbourhood you intend to own.",
      esp_launch_offer:"Annual VendVite licence",
      esp_launch_total:"Total including taxes",
      esp_launch_cta:"View the offer and activate",
      esp_setup_eyebrow:"Step 1 · Your showcase",
      esp_setup_title:"Make this page unmistakably yours.",
      esp_setup_body:"Start with your identity and promise. Save, preview and refine every detail before activating.",
      esp_section_your_identity:"Your identity",
      esp_no_photo_placeholder:"No photo",
      esp_upload_photo_button:"Upload a photo",
      esp_photo_format_size_hint:"JPG, PNG or WebP · 8&nbsp;MB max",
      esp_portrait_field_help:"Your portrait — shown in the «&nbsp;Your broker&nbsp;» section of your page and as the share image on social media.",
      esp_display_name_label:"Display name",
      esp_display_name_help:"Your name as it appears everywhere: the top bar, the broker section, the footer.",
      esp_title_label:"Title",
      esp_title_help:"Your professional title, under your name in the broker section. Empty = «&nbsp; &nbsp;».",
      esp_agency_label:"Agency",
      esp_agency_help:"The name of your agency, shown under your title in the broker section.",
      esp_phone_label:"Phone",
      esp_phone_help:"The call button in the top bar of your page.",
      esp_email_label:"Email",
      esp_email_help:"This is where every new lead is sent to you — never shown publicly.",
      esp_section_about_you:"About you",
      esp_bio_label:"Your introduction",
      esp_bio_help:"The paragraph in the «&nbsp;The agent&nbsp;» section of your page — your philosophy, your approach, in one or two sentences. Clear it and the default comes back.",
      esp_section_your_hook:"Your hook",
      esp_main_headline_label:"Main headline",
      esp_main_headline_help:"The big headline at the top of your page. Clear it and the default comes back.",
      esp_subtitle_label:"Subtitle",
      esp_subtitle_help:"The paragraph under the headline — your promise to the seller. Clear it and the default comes back.",
      esp_note_under_field_label:"Note under the field",
      esp_note_under_field_help:"The reassuring line under the address field (fees, reply time…). Clear it and the default comes back.",
      esp_section_your_numbers:"Your numbers",
      esp_stats_shown_in_proof_section:"Shown in the «&nbsp;The proof, in numbers&nbsp;» section. An empty field keeps the template value.",
      esp_stat_properties_sold_label:"Properties sold",
      esp_stat_properties_sold_help:"Total number of properties you have sold.",
      esp_stat_days_on_market_label:"Days on market",
      esp_stat_days_on_market_help:"Average time to sell, in days.",
      esp_stat_sold_to_list_ratio_label:"Sold-to-list ratio",
      esp_stat_sold_to_list_ratio_help:"Sold price vs list price, as a % (the \"%\" is added automatically).",
      esp_stat_volume_millions_label:"Volume (M$)",
      esp_stat_volume_millions_help:"Career volume in millions of dollars (the \"M$\" is added automatically).",
      esp_your_links_heading:"Your links",
      esp_links_icons_vs_buttons_help:"Facebook, Instagram, LinkedIn, YouTube and TikTok become icons in the footer; other links (agency site, Centris listing…) appear as buttons. No links = nothing appears.",
      esp_add_link_button:"+ Add a link",
      esp_your_testimonials_heading:"Your testimonials",
      esp_testimonials_default_help:"Leave empty to show the page's default testimonials.",
      esp_add_testimonial_button:"+ Add a testimonial",
      esp_save_button:"Save",
      esp_campaign_included_canada_post:"Included in your licence · Canada Post",
      esp_campaign_name_street_tagline:"Name a street. We target the closest doors.",
      esp_campaign_territory_explainer:"You enter an address; we draw the territory around it and pull the closest civic addresses — the immediate neighbours of your listing, of your last sale, of the area you want to own. Every letter carries your name, your agency and a QR code that leads to your page.",
      esp_doors_included_unit:"doors included",
      esp_hours_before_drop_unit:"before the drop",
      esp_price_per_tier_after_unit:"per tier after that",
      esp_this_year_suffix:"this year",
      esp_letter_preview_alt:"Preview of your letter",
      esp_letter_mailbox_heading:"What goes in the envelope",
      esp_letter_as_printed_line:"Your letter, exactly as it will be printed.",
      esp_letter_spec_before_page_url:"Black and white, one sheet printed both sides in French and English, ready for Canada Post. Your name, your agency, your contact details and a unique QR code pointing to",
      esp_letter_spec_after_page_url:". This is exactly the document your targets receive, whatever the number of doors you choose — the preview here is the piece itself, not a mockup.",
      esp_letter_open_print:"Open full size and print",
      esp_activate_sub_then_publish_qr:"Activate your subscription, then publish your page: the QR code has to lead somewhere.",
      esp_publish_before_letter_notice:"Publish your page before distributing the letter so the QR code is live.",
      esp_subscription_required_badge:"Subscription required",
      esp_included_campaign_activate_note:"Your campaign of addresses is included in the annual licence. Activate it to use it.",
      esp_view_subscription_link:"View subscription",
      esp_publish_page_first_title:"Publish your page first",
      esp_qr_needs_live_page_warning:"The QR code printed on every letter must lead to a page that is online, otherwise the campaign goes nowhere.",
      esp_back_to_my_page:"Back to my page",
      esp_how_many_doors_question:"How many doors?",
      esp_remove_tier_button:"Remove a tier",
      esp_add_tier_button:"Add a tier",
      esp_tier_step_included_doors_note:"In tiers of . Your included doors are deducted from",
      esp_deducted_from_any:"any",
      esp_area_centre_address_label:"The address at the heart of the area you want to work",
      esp_civic_address_example_ph:"e.g. 1088 rue de Chambord, Saint-Jérôme",
      esp_address_autocomplete_hint:"Start typing: choose the address from the list for an exact point. The nearest neighbours are counted out from there.",
      esp_see_my_territory_button:"View my territory",
      esp_stat_addresses_selected:"addresses selected",
      esp_stat_farthest_address:"the farthest",
      esp_stat_total_swept:"swept in total",
      esp_territory_centre_label:"Territory centre:",
      esp_view_selected_addresses_link:"View the selected addresses",
      esp_team_note_optional_label:"Anything our team should know? (optional)",
      esp_team_note_placeholder:"e.g. avoid condo towers, target single-family homes…",
      esp_after_confirm_we_take_over:"The moment you confirm, we take over.",
      esp_fulfilment_steps_lead:"We check the list, complete the postal codes, print your letters and drop them at Canada Post",
      esp_within_business_hours:"within &nbsp;business hours",
      esp_nothing_else_to_do_tail:". You have nothing else to do.",
      esp_paypal_test_mode_notice:"PayPal test mode is active: buying an extra tier takes no real money and will be marked as a test.",
      esp_confirm_launch_mailing_btn:"Confirm and launch the mailing",
      esp_address_source_manual_check:"The addresses come from public mapping data. We check every list by hand before printing; a civic number that doesn't exist is removed and never billed to you.",
      esp_your_campaigns_heading:"Your campaigns",
      esp_no_campaigns_first_included:"No campaigns yet. The first one is included in your licence.",
      esp_campaign_col_status:"Status",
      esp_campaign_col_territory:"Territory",
      esp_campaign_col_doors:"Doors",
      esp_campaign_col_amount:"Amount",
      esp_campaign_col_date:"Date",
      esp_territory_reload_btn:"Reload this territory",
      esp_cancel_reclaim_included_btn:"Cancel and reclaim my included campaign",
      esp_leads_total_label:"Total leads",
      esp_leads_new_label:"New",
      esp_leads_last_30_days_label:"Last 30 days",
      esp_leads_empty_state:"No leads yet.",
      esp_lead_private_notes_ph:"Private notes…",
      esp_paypal_test_success_title:"PayPal test successful. Your trial access is open.",
      esp_paypal_test_success_body:"No real payment. You can now publish your page, test the QR code, receive a lead and request a targeted campaign.",
      esp_payment_confirmed_licence_active:"Payment confirmed. Your licence is active.",
      esp_invoice_available_emailed:"Your VendVite invoice is available below, and a copy has been emailed to you.",
      esp_annual_membership_heading:"Annual membership",
      esp_paypal_test_mode_badge:"PAYPAL TEST MODE",
      esp_test_account_only_note:"Test account only · no real money · isolated trial access",
      esp_invoice_line_membership:"Membership",
      esp_invoice_line_gst:"GST (5&nbsp;%)",
      esp_invoice_line_qst:"QST (9.975&nbsp;%)",
      esp_invoice_line_total:"Total",
      esp_test_access_active_title:"Test access active",
      esp_test_access_until_date:"Full journey available until , in test mode only.",
      esp_test_actions_not_a_sale:"Publishing, leads and campaign requests are clearly marked as tests and do not count as a sale.",
      esp_renewal_cancelled_title:"Renewal cancelled",
      esp_page_online_until_date:"Your page stays online until .",
      esp_reactivate_btn:"Reactivate",
      esp_subscription_active_title:"Subscription active",
      esp_renews_on_date:"Renews on .",
      esp_cancel_renewal_btn:"Cancel renewal",
      esp_real_subscription_protected_test:"Your real subscription is protected during test-mode trials. Switch back to live mode to manage its renewal.",
      esp_paypal_secure_cancel_anytime:"Payment secured by PayPal. Cancel at any time.",
      esp_perk_private_page_named:"Your private page, in your name, on vendvite.app",
      esp_perk_unlimited_valuation_capture:"Unlimited capture of valuation requests",
      esp_perk_instant_lead_email_alert:"Instant email alert on every lead",
      esp_perk_private_lead_register:"Your lead register, yours alone",
      esp_perk_free_edits_anytime:"Changes at any time, at no charge",
      esp_invoices_heading:"My invoices",
      esp_social_link_label_placeholder:"Label (e.g. Instagram)",
      esp_save_success_toast:"Saved ✓",
      esp_save_failed_toast:"Save failed",
      esp_photo_too_large_error:"Image too large (8 MB max).",
      esp_uploading_status:"Uploading…",
      esp_photo_updated_toast:"Photo updated ✓",
      esp_upload_refused_error:"Upload refused.",
      esp_payment_not_open_contact_us:"Payment isn't open yet. Write to us and we'll activate your page manually.",
      esp_payment_open_failed_retry:"Couldn't open payment. Try again in a moment.",
      esp_payment_open_failed:"Couldn't open payment.",
      esp_confirm_cancellation_button:"Confirm cancellation",
      esp_map_service_busy_retry_prefix:"The map service is busy — retrying (",
      esp_sweep_resume_prefix:"Resuming the sweep already run around ",
      esp_sweep_area_start_prefix:"Sweeping the area around ",
      esp_territory_restored_prefix:"Territory restored — ",
      esp_territory_restored_suffix:" addresses, no new sweep needed.",
      esp_area_centre_address_hint:"Enter the address at the heart of the area you want to work.",
      esp_locating_short_status:"Pinpointing…",
      esp_locating_address_status:"Locating the address…",
      esp_osm_area_uncovered_error:"OpenStreetMap doesn't cover this area yet. Write to us: we build the list by hand.",
      esp_map_service_no_response_error:"The map service didn't respond. Try again in a moment.",
      esp_campaign_price_included_html:"<span class=\"camp-prix-n\">Included</span><span class=\"camp-prix-l\">covered by your licence</span>",
      esp_qty_included_plus_prefix:" included + ",
      esp_qty_letters_separator:" letters · ",
      esp_confirm_launch_mailing_btn_js:"Confirm and launch the mailing",
      esp_payment_not_configured_manual:"Payment isn't set up yet. Write to us and we'll launch the campaign manually.",
      esp_opening_paypal:"Opening PayPal…",
      esp_only_found_count_prefix:"We only found ",
      esp_addresses_of_requested_mid:" addresses of the ",
      esp_reduce_qty_or_denser_area:" requested. Reduce the quantity or choose a denser area.",
      esp_invalid_qty_choose_tier:"Invalid quantity. Choose a tier of ",
      esp_order_covered_by_included:"This order is fully covered by your included campaign — no payment required.",
      esp_included_campaign_used_elsewhere:"Your included campaign was just used elsewhere. Reload the page to see the updated price.",
      esp_publish_page_before_qr:"Publish your page first: the letter's QR code has to lead somewhere.",
      esp_activate_subscription_first:"Activate your subscription to launch a campaign.",
      esp_session_expired_reopen_link:"Your session has expired. Reopen your personal access link.",
      esp_launch_success_prefix:"Off it goes ✓ Your ",
      esp_letters_at_canada_post_by:" letters are dropped at Canada Post by ",
      esp_campaign_confirmed:"Campaign confirmed",
      esp_yearly_included_already_used:"Your included campaign for the year is already used. Write to us to add another.",
      esp_previous_request_still_processing:"One moment — your previous request is still processing.",
      esp_confirmation_failed_retry:"The confirmation didn't go through. Try again in a moment.",
      esp_territory_reloaded_prefix:"Territory reloaded — ",
      esp_addresses_adjust_or_relaunch:" addresses. Adjust the quantity or relaunch.",
      esp_campaign_no_longer_editable:"This campaign can no longer be changed.",
      esp_cancel_reclaim_included_btn_js:"Cancel and reclaim my included campaign",
      esp_test_payment_accepted:"Test payment accepted ✓ No real amount was charged. The campaign is recorded and marked as a test.",
      esp_payment_received_72_business_h:"Payment received ✓ Your letters are dropped at Canada Post within 72 business hours.",
      esp_payment_cancelled_included_back:"Payment cancelled. Your included campaign is back in your hands — relaunch whenever you like.",
      esp_order_cancelled_included_free:"Order cancelled ✓ Your included campaign is available again.",
      esp_paypal_confirmation_pending:"We haven't received PayPal's confirmation yet. It sometimes arrives with a slight delay; your campaign will appear in the history.",
      ltr_title_prefix:"Letter to homeowners — ",
      ltr_printbar_meta:"Custom letter · Black and white · Letter format",
      ltr_print_button:"Print or save as PDF",
      ltr_eyebrow_attention:"For the attention of the homeowner",
      ltr_headline:"What if you knew the current value of your property?",
      ltr_salutation:"Hello,",
      ltr_body_assets:"Your property is likely one of your most significant assets. Yet its real value shifts with recent sales in your area — often quite differently from the municipal assessment.",
      ltr_offer_lead:"I am offering you a",
      ltr_offer_bold:"free, no-obligation valuation",
      ltr_offer_tail:". You do not have to be planning to sell today. Knowing where you stand in the market is simply useful information to keep, now and later on.",
      ltr_reasons_aria:"Why request a valuation",
      ltr_reason1_title:"To plan",
      ltr_reason1_body:"A possible sale, a refinancing or your next project.",
      ltr_reason2_title:"To decide",
      ltr_reason2_body:"Which renovations to put first, given the reality of your market.",
      ltr_reason3_title:"To know",
      ltr_reason3_body:"What recent sales really say about your property.",
      ltr_body_scan:"No pressure, no obligation. Simply scan the code below, enter your address, and your dossier will begin to take shape. I can then prepare an estimate backed by the data for your area.",
      ltr_cta_kicker:"Your valuation is waiting",
      ltr_cta_title:"Scan. Enter your address. Discover your potential.",
      ltr_cta_terms:"Free · Confidential · No obligation",
      ltr_qr_alt:"QR code to the valuation page of ",
      ltr_pullquote:"Good information today can become an excellent decision tomorrow.",
      ltr_fineprint:"This offer is free and carries no obligation to sell or to retain the broker's services. The estimate provided is an opinion of market value and does not replace a valuation by a chartered appraiser. Each real estate agency is an independently owned and operated business.",
      bp_preview_banner:"Private preview — this page is not public yet.",
      bp_preview_back:"Back to my console",
      esp_title_help_lead:"Your professional title, under your name in the broker section. Empty = \"",
      esp_title_help_tail:"\".",
      esp_lock_membership_lead:"Your campaign of ",
      esp_lock_membership_tail:" addresses is included in the annual licence. Activate it to use it.",
      esp_tiers_of_lead:"In tiers of ",
      esp_tiers_of_tail:".",
      esp_credit_applies_lead:"Your ",
      esp_credit_applies_mid:" included doors come off",
      esp_within_hours_lead:"within ",
      esp_within_hours_tail:"&nbsp;business hours",
      esp_sandbox_until_lead:"Full journey available until ",
      esp_sandbox_until_tail:", in test mode only.",
      esp_page_online_until_lead:"Your page stays online until ",
      esp_page_online_until_tail:".",
      esp_renews_on_lead:"Renews on ",
      esp_renews_on_tail:".",
      agent_fallback_name:"Your broker",
      esp_disclaimer_label:"Your agency's legal notice",
      esp_disclaimer_help:"The line at the foot of your page. Every brand has its own — enter your agency's. Empty = a generic notice.",
      esp_disclaimer_ph:"e.g. Independently owned and operated franchise of …",
      esp_tm_author_ph:"Name",
      esp_tm_area_ph:"Area",
      esp_tm_quote_ph:"Testimonial",
      esp_tm_result_ph:"Result",
      esp_qty_at_price:" at ",
      esp_plus_taxes:" + taxes",
      esp_test_page_live:"Your test page is live.",
      esp_page_live:"Your page is live.",
      esp_campaigns_included_plural:"campaigns included",
      esp_campaign_included_singular:"campaign included",
      esp_leads_empty_unpublished:"Publish your page to start receiving valuation requests.",
      esp_leads_empty_published:"Your page is live. Requests will appear here and you will be notified by email.",
      esp_credit_rest_lead:" order size; the rest is ",
      esp_credit_rest_tail:"&nbsp;$ per letter, plus taxes.",
      esp_per_letter_taxes_extra:"&nbsp;$ per letter, plus taxes.",
    }
  };

  var MODULES = [
    { key:'leads', label:'Demande', icon:'inbox', columns:['name','address','timeframe','status','created_at'], fields:[
      { name:'name', type:'text', required:true, label:'Nom', description:"Nom complet du propriétaire.", placeholder:'Ex. Marie Tremblay' },
      { name:'email', type:'email', label:'Courriel', description:"Adresse courriel pour le suivi.", placeholder:'personne@exemple.com' },
      { name:'phone', type:'text', label:'Téléphone', description:'Numéro de téléphone du prospect.', placeholder:'(514) 000-0000' },
      { name:'address', type:'textarea', label:'Adresse', description:"Adresse de la propriété à évaluer.", placeholder:'123 rue Principale, Montréal' },
      { name:'timeframe', type:'text', label:'Échéancier', description:'Quand le propriétaire souhaite vendre.', placeholder:"Ex. D'ici 3 mois" },
      { name:'status', type:'select', options:['nouveau','contacté','évalué','fermé'], default:'nouveau', label:'Statut', description:'Étape de suivi du dossier.' },
      { name:'notes', type:'textarea', label:'Notes internes', description:"Notes privées visibles seulement dans l'administration.", placeholder:'Ex. Rappeler jeudi après-midi.' }
    ]},
    { key:'testimonials', label:'Témoignage', icon:'star', columns:['author','neighborhood','sale_result','published','created_at'], fields:[
      { name:'author', type:'text', required:true, label:'Nom du vendeur', description:'Nom affiché sous le témoignage.', placeholder:'Ex. Julie & Marc' },
      { name:'neighborhood', type:'text', label:'Quartier', description:'Secteur ou quartier de la vente.', placeholder:'Ex. Rosemont, Montréal' },
      { name:'quote', type:'textarea', required:true, label:'Témoignage', description:'Le texte du témoignage client.', placeholder:'Ex. Vendu en six jours au-dessus du prix demandé…' },
      { name:'sale_result', type:'text', label:'Résultat de vente', description:'Résultat chiffré affiché en rouge (ex. +12 % du prix demandé).', placeholder:'Ex. +12 % du prix demandé' },
      { name:'sort_order', type:'number', min:0, step:1, label:"Ordre d'affichage", description:'Plus petit = affiché en premier.', placeholder:'0' },
      { name:'published', type:'boolean', default:true, label:'Publié', description:'Décochez pour masquer ce témoignage du site.' }
    ]},
    { key:'posts', label:'Note', icon:'edit', columns:['title','category','published','created_at'], fields:[
      { name:'title', type:'text', required:true, maxLength:160, label:'Titre', description:'Titre de la note de marché.', placeholder:'Ex. Le marché des vendeurs à Laval ce printemps' },
      { name:'excerpt', type:'textarea', label:'Extrait', description:'Court résumé affiché sur la carte (2-3 phrases).', placeholder:'Ex. Les délais de vente se resserrent…' },
      { name:'content', type:'textarea', label:'Contenu', description:'Corps complet de la note. Séparez les paragraphes par une ligne vide.', placeholder:'Rédigez votre note ici…' },
      { name:'image_url', type:'image', label:'Image de couverture', description:'Image affichée en tête de la note. Recommandé : 1200×675 px paysage.' },
      { name:'category', type:'text', maxLength:50, label:'Catégorie', description:'Regroupe les notes (ex. Marché, Conseils).', placeholder:'Ex. Marché' },
      { name:'published', type:'boolean', default:true, label:'Publié', description:'Décochez pour enregistrer en brouillon.' }
    ]}
  ];

  var SETTINGS_FIELDS = [
    { name:'social_facebook', type:'url', label:'Facebook', description:'Lien de votre page Facebook.' },
    { name:'social_instagram', type:'url', label:'Instagram', description:'Lien de votre profil Instagram.' },
    { name:'social_linkedin', type:'url', label:'LinkedIn', description:'Lien de votre profil LinkedIn.' },
    { name:'social_youtube', type:'url', label:'YouTube', description:'Lien de votre chaîne YouTube.' },
    { name:'social_tiktok', type:'url', label:'TikTok', description:'Lien de votre compte TikTok.' }
  ];

  var SETTINGS_GROUPS = [
    { title:"Coordonnées de l'agent", fields:[
      { key:'agent_name', label:'Nom affiché', type:'text', placeholder:'Ex. Marie Tremblay' },
      { key:'agent_email', label:'Courriel', type:'email', placeholder:'vous@exemple.com' },
      { key:'agent_phone', label:'Téléphone', type:'text', placeholder:'(514) 000-0000' },
      { key:'agent_license', label:'Permis / titre', type:'text', placeholder:'Courtier immobilier · OACIQ' },
      { key:'tagline', label:'Slogan', type:'text', placeholder:'Évaluation gratuite de votre propriété' }
    ]},
    { title:"Statistiques (page d'accueil)", fields:[
      { key:'stat_homes_sold', label:'Propriétés vendues', type:'number', placeholder:'512' },
      { key:'stat_avg_days', label:'Jours au marché (moyenne)', type:'number', placeholder:'19' },
      { key:'stat_list_to_sale', label:'Ratio prix vendu / demandé (%)', type:'number', placeholder:'99' },
      { key:'stat_career_volume', label:'Volume de carrière (M$)', type:'number', placeholder:'285' }
    ]},
    { title:'Réseaux sociaux', fields:[
      { key:'social_facebook', label:'Facebook', type:'url', placeholder:'https://facebook.com/...' },
      { key:'social_instagram', label:'Instagram', type:'url', placeholder:'https://instagram.com/...' },
      { key:'social_linkedin', label:'LinkedIn', type:'url', placeholder:'https://linkedin.com/in/...' },
      { key:'social_youtube', label:'YouTube', type:'url', placeholder:'https://youtube.com/@...' },
      { key:'social_tiktok', label:'TikTok', type:'url', placeholder:'https://tiktok.com/@...' }
    ]}
  ];

  function tp(req, p){ return (typeof req.tenantPath === 'function') ? req.tenantPath(p) : p.replace(/^\//,''); }
  function formatPhone(p){ if(!p) return ''; var d=String(p).replace(/\D/g,''); if(d.length===10) return '('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6); if(d.length===11 && d[0]==='1') return '1 ('+d.slice(1,4)+') '+d.slice(4,7)+'-'+d.slice(7); return p; }
  function formatDate(d, lang){ if(!d) return ''; try{ return new Date(d).toLocaleDateString(lang==='en'?'en-CA':'fr-CA',{ year:'numeric', month:'long', day:'numeric' }); }catch(e){ return ''; } }
  function statusClass(s){ s=(s||'nouveau'); if(s==='contacté'||s==='contacted') return 'badge-contacted'; if(s==='évalué'||s==='valued') return 'badge-valued'; if(s==='fermé'||s==='closed') return 'badge-closed'; return 'badge-new'; }
  async function getSettings(){ try{ var rows=await db.all('SELECT key,value FROM admin_settings'); var s={}; rows.forEach(function(r){ s[r.key]=r.value; }); return s; }catch(e){ return {}; } }
  function applyTextOverrides(t, settings, lang){ for(var k in settings){ if(k.indexOf('text_')===0 && k.slice(-(lang.length+1))==='_'+lang){ var tk=k.slice(5, -(lang.length+1)); if(tk) t[tk]=settings[k]; } } return t; }

  (async function(){
    try{
      var defs = {
        agent_name: cfg.businessName || cfg.ownerName || cfg.displayName || 'Votre courtier',
        agent_email: cfg.contactEmail || '',
        agent_phone: cfg.contactPhone || '',
        agent_license: 'Courtier immobilier · OACIQ'
      };
      for(var k in defs){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k, defs[k]]); }
    }catch(e){}
  })();

  router.use(async function(req,res,next){
    try{ if(req.method==='GET' && req.path.indexOf('/api/')!==0 && req.path.indexOf('/admin')!==0 && req.path.indexOf('.')===-1){ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); } }catch(e){}
    next();
  });

  router.use(function(req,res,next){
    var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if(lang!=='en') lang='fr';
    if(req.query.lang){ try{ res.cookie('pwa_lang', lang, { maxAge:31536000000 }); }catch(e){} }
    req.lang = lang;
    next();
  });

  async function baseLocals(req){
    var lang=req.lang; var settings=await getSettings();
    var t=applyTextOverrides(Object.assign({}, T[lang]||T.fr), settings, lang);
    var ogImage = settings._p_agent_image_url || '';
    var canonical = '';
    try{ if(typeof req.tenantUrl==='function') canonical=req.tenantUrl('/'); }catch(e){}
    // La plateforme injecte <base href> dans toute page locataire : un lien
    // « ?lang=en » tout nu se resout donc contre la RACINE et renvoie a
    // l'accueil au lieu de changer la langue de la page courante. On rend le
    // chemin courant, sans barre oblique initiale, pour rester sur place sous
    // les deux montages.
    var cheminCourant = String(req.path || '/').replace(/^\//, '');
    return { t:t, lang:lang, settings:settings, formatDate:function(d){ return formatDate(d, lang); }, formatPhone:formatPhone, googleApiKey:(services.google && services.google.mapsApiKey) || '', ogImage:ogImage, canonical:canonical, statusClass:statusClass, cheminCourant:cheminCourant, langueVisible:true };
  }

  router.get('/', async function(req,res){
    try{
      var L=await baseLocals(req);
      var testimonials=await db.all('SELECT * FROM testimonials WHERE published=1 ORDER BY sort_order ASC, created_at DESC');
      var posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign(L, { testimonials:testimonials, posts:posts, isHome:true }));
    }catch(e){ console.error('index', e); res.status(500).send('Erreur'); }
  });

  router.get('/journal/:id', async function(req,res){
    try{
      var L=await baseLocals(req);
      var post=await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]);
      if(!post || !(post.published==1 || post.published===true)) return res.redirect('.');
      res.render('journal', Object.assign(L, { post:post, isHome:false }));
    }catch(e){ console.error('journal', e); res.redirect('.'); }
  });

  router.post('/api/lead', async function(req,res){
    try{
      var b=req.body||{};
      var name=(b.name||'').trim(), address=(b.address||'').trim();
      if(!name || !address) return res.status(400).json({ error:'missing' });
      var lat=b.lat?parseFloat(b.lat):null, lng=b.lng?parseFloat(b.lng):null;
      if(isNaN(lat)) lat=null; if(isNaN(lng)) lng=null;
      await db.run('INSERT INTO leads (name,email,phone,address,lat,lng,timeframe,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[name,(b.email||'').trim(),(b.phone||'').trim(),address,lat,lng,(b.timeframe||'').trim(),'nouveau']);
      try{
        if(cfg.contactEmail){
          var html="<h2>Nouvelle demande d'évaluation</h2><p><b>Nom :</b> "+name+"</p><p><b>Courriel :</b> "+(b.email||'—')+"</p><p><b>Téléphone :</b> "+(b.phone||'—')+"</p><p><b>Adresse :</b> "+address+"</p><p><b>Échéancier :</b> "+(b.timeframe||'—')+"</p>"+(lat?("<p><b>Coordonnées :</b> "+lat+", "+lng+"</p>"):"");
          try { await services.email.send({ to:cfg.contactEmail, subject:'Nouvelle évaluation — '+name, html:html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      }catch(mailErr){ console.error('lead email', mailErr.message); }
      res.json({ success:true });
    }catch(e){ console.error('lead', e); res.status(500).json({ error:'server' }); }
  });

  function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.redirect(tp(req,'/admin/login')); next(); }
  function apiAdmin(req,res){ if(!services.admin.isAdmin(req)){ res.status(403).json({ error:'Forbidden' }); return false; } return true; }
  function findModule(k){ for(var i=0;i<MODULES.length;i++){ if(MODULES[i].key===k) return MODULES[i]; } return null; }

  async function gatherStats(){
    var s={ leads:0,newLeads:0,testimonials:0,posts:0,visits:0,recentVisits:0,pushCount:0,userCount:0,sales:0,revenueCents:0 };
    try{ var r=await db.get('SELECT COUNT(*)::int c FROM leads'); s.leads=r.c; }catch(e){}
    try{ var r2=await db.get("SELECT COUNT(*)::int c FROM leads WHERE status='nouveau'"); s.newLeads=r2.c; }catch(e){}
    try{ var r3=await db.get('SELECT COUNT(*)::int c FROM testimonials'); s.testimonials=r3.c; }catch(e){}
    try{ var r4=await db.get('SELECT COUNT(*)::int c FROM posts'); s.posts=r4.c; }catch(e){}
    try{ var r5=await db.get('SELECT COUNT(*)::int c FROM site_visits'); s.visits=r5.c; }catch(e){}
    try{ var r6=await db.get("SELECT COUNT(*)::int c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); s.recentVisits=r6.c; }catch(e){}
    try{ if(services.push && services.push.getSubscriptionCount){ s.pushCount=await services.push.getSubscriptionCount(); } }catch(e){}
    try{ if(services.auth && services.auth.getUserCount){ s.userCount=await services.auth.getUserCount(); } }catch(e){}
    try{ var r7=await db.get('SELECT COUNT(*)::int c, COALESCE(SUM(total_cents),0)::bigint revenue FROM broker_invoices WHERE COALESCE(is_test,0)=0'); s.sales=Number(r7.c||0); s.revenueCents=Number(r7.revenue||0); }catch(e){}
    return s;
  }

  router.get('/admin', requireAdmin, async function(req,res){
    try{
      var L=await baseLocals(req);
      var stats=await gatherStats();
      var recentLeads=await db.all('SELECT * FROM leads ORDER BY created_at DESC LIMIT 8');
      res.render('admin', Object.assign(L, { active:'dashboard', stats:stats, recentLeads:recentLeads }));
    }catch(e){ console.error('admin', e); res.status(500).send('Erreur'); }
  });

  router.get('/admin/leads', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-leads', Object.assign(L, { active:'leads', moduleConfig:findModule('leads') })); });
  router.get('/admin/testimonials', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-testimonials', Object.assign(L, { active:'testimonials', moduleConfig:findModule('testimonials') })); });
  router.get('/admin/posts', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-posts', Object.assign(L, { active:'posts', moduleConfig:findModule('posts') })); });
  router.get('/admin/courtiers', requireAdmin, async function(req,res){
    var L=await baseLocals(req);
    var courtiers=await db.all(
      'SELECT b.*, (SELECT COUNT(*)::int FROM broker_leads l WHERE l.broker_id=b.id) AS lead_count FROM brokers b ORDER BY (b.status=\'applied\') DESC, b.created_at DESC');
    var cc={ applied:0, invited:0, active:0, other:0 };
    (courtiers||[]).forEach(function(b){ if(cc[b.status]!=null) cc[b.status]++; else cc.other++; });
    res.render('admin-courtiers', Object.assign(L, { active:'courtiers', courtiers:courtiers||[], cc:cc }));
  });
  router.get('/admin/ventes', requireAdmin, async function(req,res){
    try{
      var L=await baseLocals(req);
      var totals=await db.get('SELECT COUNT(*)::int invoice_count, COUNT(DISTINCT broker_id)::int customer_count, COALESCE(SUM(subtotal_cents),0)::bigint subtotal_cents, COALESCE(SUM(gst_cents),0)::bigint gst_cents, COALESCE(SUM(qst_cents),0)::bigint qst_cents, COALESCE(SUM(total_cents),0)::bigint total_cents FROM broker_invoices WHERE COALESCE(is_test,0)=0');
      var members=await db.get("SELECT COUNT(*) FILTER (WHERE status='active' AND membership_expires_at>NOW())::int active_count, COUNT(*) FILTER (WHERE status='cancelled' AND membership_expires_at>NOW())::int ending_count FROM brokers");
      var invoices=await db.all('SELECT i.*,b.full_name,b.agency,b.email FROM broker_invoices i JOIN brokers b ON b.id=i.broker_id ORDER BY i.payment_time DESC,i.id DESC LIMIT 250');
      var monthly=await db.all("SELECT date_trunc('month',payment_time) AS period_month,COUNT(*)::int invoice_count,COALESCE(SUM(total_cents),0)::bigint total_cents FROM broker_invoices WHERE COALESCE(is_test,0)=0 AND payment_time>NOW()-INTERVAL '12 months' GROUP BY 1 ORDER BY 1");
      var livePaypal=await paypalCfg('live');
      var sandboxPaypal=await paypalCfg('sandbox');
      var paypalState={
        mode:(await currentPaypalMode()),
        liveReady:paypalReady(livePaypal),
        sandboxReady:paypalReady(sandboxPaypal),
        sandboxCredentialsReady:!!(sandboxPaypal.clientId&&sandboxPaypal.secret),
        sandboxPlanId:sandboxPaypal.planId||''
      };
      var maxMonth=1;
      (monthly||[]).forEach(function(m){ maxMonth=Math.max(maxMonth,Number(m.total_cents||0)); });
      res.render('admin-ventes', Object.assign(L, { active:'ventes', totals:totals||{}, members:members||{}, invoices:invoices||[], monthly:monthly||[], maxMonth:maxMonth, paypalState:paypalState }));
    }catch(e){ console.error('admin ventes',e); res.status(500).send('Erreur'); }
  });
  router.post('/api/admin/paypal/mode', async function(req,res){
    if(!apiAdmin(req,res)) return;
    try{
      var mode=String(req.body&&req.body.mode||'').trim().toLowerCase();
      if(mode!=='live'&&mode!=='sandbox') return res.status(400).json({ error:'mode' });
      var selected=await paypalCfg(mode);
      if(!paypalReady(selected)) return res.status(409).json({ error:'paypal_absent', code:'NOT_CONFIGURED', mode:mode });
      await db.run("INSERT INTO admin_settings (key,value,updated_at) VALUES ('paypal_mode',$1,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()",[mode]);
      res.json({ success:true, mode:mode });
    }catch(e){ console.error('paypal mode',e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/paypal/sandbox/plan', async function(req,res){
    if(!apiAdmin(req,res)) return;
    try{
      var c=await paypalCfg('sandbox');
      if(!c.clientId||!c.secret) return res.status(409).json({ error:'sandbox_credentials_missing', code:'SANDBOX_CREDENTIALS_MISSING' });
      var token=await paypalToken(c);
      var authHeaders={ 'Authorization':'Bearer '+token, 'Content-Type':'application/json' };

      // Reuse and verify a plan already entered or created. This makes the
      // button idempotent and avoids littering PayPal with duplicate plans.
      if(c.planId){
        var existingResponse=await services.fetch(c.base+'/v1/billing/plans/'+encodeURIComponent(c.planId),{ headers:{'Authorization':'Bearer '+token} });
        if(existingResponse.ok){
          var existingPlan=await existingResponse.json();
          if(existingPlan.status!=='ACTIVE'){
            var activation=await services.fetch(c.base+'/v1/billing/plans/'+encodeURIComponent(c.planId)+'/activate',{ method:'POST',headers:authHeaders,body:'{}' });
            if(!activation.ok) return res.status(502).json({ error:'paypal_plan_activation', code:'PAYPAL_PLAN_ACTIVATION_FAILED' });
          }
          await saveAdminSetting('paypal_sandbox_plan_id',c.planId);
          return res.json({ success:true, planId:c.planId, existing:true });
        }
        if(existingResponse.status!==404) return res.status(502).json({ error:'paypal_plan_lookup', code:'PAYPAL_UNAVAILABLE' });
      }

      var productId=await readAdminSetting('paypal_sandbox_product_id');
      if(productId){
        var productCheck=await services.fetch(c.base+'/v1/catalogs/products/'+encodeURIComponent(productId),{ headers:{'Authorization':'Bearer '+token} });
        if(productCheck.status===404) productId='';
        else if(!productCheck.ok) return res.status(502).json({ error:'paypal_product_lookup', code:'PAYPAL_UNAVAILABLE' });
      }
      if(!productId){
        var productResponse=await services.fetch(c.base+'/v1/catalogs/products',{
          method:'POST',
          headers:Object.assign({},authHeaders,{'PayPal-Request-Id':'vendvite-sbx-product-v1','Prefer':'return=representation'}),
          body:JSON.stringify({ name:'VendVite — Adhésion annuelle (sandbox)',description:'Outil annuel de génération de leads pour courtiers immobiliers — environnement de test',type:'SERVICE',category:'SOFTWARE',home_url:'https://vendvite.app' })
        });
        var productBody=await productResponse.json().catch(function(){return{};});
        if(!productResponse.ok||!productBody.id){ console.error('paypal sandbox product',productResponse.status,productBody); return res.status(502).json({ error:'paypal_product',code:'PAYPAL_PRODUCT_FAILED' }); }
        productId=String(productBody.id);
        await saveAdminSetting('paypal_sandbox_product_id',productId);
      }

      var planResponse=await services.fetch(c.base+'/v1/billing/plans',{
        method:'POST',
        headers:Object.assign({},authHeaders,{'PayPal-Request-Id':'vendvite-sbx-plan-68870-v1','Prefer':'return=representation'}),
        body:JSON.stringify({
          product_id:productId,
          name:'VendVite annuel — 688,70 $ CAD (sandbox)',
          description:'599,00 $ + TPS 29,95 $ + TVQ 59,75 $ inclus — TEST SEULEMENT',
          billing_cycles:[{ frequency:{interval_unit:'YEAR',interval_count:1},tenure_type:'REGULAR',sequence:1,total_cycles:0,pricing_scheme:{fixed_price:{value:'688.70',currency_code:'CAD'}} }],
          payment_preferences:{auto_bill_outstanding:true,payment_failure_threshold:3}
        })
      });
      var planBody=await planResponse.json().catch(function(){return{};});
      if(!planResponse.ok||!/^P-/.test(String(planBody.id||''))){ console.error('paypal sandbox plan',planResponse.status,planBody); return res.status(502).json({ error:'paypal_plan',code:'PAYPAL_PLAN_FAILED' }); }
      await saveAdminSetting('paypal_sandbox_plan_id',String(planBody.id));
      res.json({ success:true,planId:String(planBody.id),existing:false });
    }catch(e){ console.error('paypal sandbox plan creator',e); res.status(500).json({ error:'server' }); }
  });
  router.get('/admin/ventes/factures/:id/pdf', requireAdmin, async function(req,res){
    try{
      var invoice=await db.get('SELECT i.*,b.full_name,b.agency,b.email FROM broker_invoices i JOIN brokers b ON b.id=i.broker_id WHERE i.id=$1',[req.params.id]);
      if(!invoice) return res.status(404).send('Facture introuvable');
      var pdf=invoiceTools.buildInvoicePdf(invoice,invoice,invoiceIssuer());
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="'+invoice.invoice_number+'.pdf"');
      res.setHeader('Cache-Control','private, no-store');
      res.send(pdf);
    }catch(e){ console.error('admin invoice pdf',e); res.status(500).send('Impossible de générer la facture'); }
  });
    router.get('/admin/settings', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-settings', Object.assign(L, { active:'settings', settingsGroups:SETTINGS_GROUPS })); });

  router.get('/api/admin/stats', async function(req,res){ if(!apiAdmin(req,res))return; try{ var s=await gatherStats(); res.json({ userCount:s.userCount, pushSubscriberCount:s.pushCount, totalVisits:s.visits, recentVisits:s.recentVisits, leads:s.leads, newLeads:s.newLeads, testimonials:s.testimonials, posts:s.posts, sales:s.sales, revenueCents:s.revenueCents }); }catch(e){ res.status(500).json({ error:'server' }); } });

  router.get('/api/admin/modules', function(req,res){ if(!apiAdmin(req,res))return; res.json({ modules:MODULES.map(function(m){ return { key:m.key, label:m.label, icon:m.icon, fields:m.fields }; }), settingsFields:SETTINGS_FIELDS }); });

  router.get('/api/admin/settings', async function(req,res){ if(!apiAdmin(req,res))return; res.json(await getSettings()); });
  router.put('/api/admin/settings', async function(req,res){ if(!apiAdmin(req,res))return; try{ var k=req.body.key, v=req.body.value; if(!k) return res.status(400).json({ error:'key' }); await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,v]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); } });

  function normalize(m, body){ var data={}; m.fields.forEach(function(f){ if(body[f.name]===undefined) return; var v=body[f.name]; if(f.type==='boolean'){ v=(v===true||v==='true'||v===1||v==='1'||v==='on')?1:0; } else if(f.type==='number'){ v=(v===''||v===null)?null:Number(v); } data[f.name]=v; }); return data; }

  function buildInsert(tbl, data){
    var keys=Object.keys(data);
    var cols=keys.join(',');
    var ph=keys.map(function(x,i){ return '$'+(i+1); }).join(',');
    var vals=keys.map(function(k){ return data[k]; });
    return { sql:'INSERT INTO '+tbl+' ('+cols+') VALUES ('+ph+') RETURNING id', vals:vals };
  }

  function buildUpdate(tbl, data, id){
    var keys=Object.keys(data);
    var set=keys.map(function(k,i){ return k+'=$'+(i+1); }).join(',');
    var vals=keys.map(function(k){ return data[k]; });
    vals.push(id);
    return { sql:'UPDATE '+tbl+' SET '+set+', updated_at=NOW() WHERE id=$'+(keys.length+1), vals:vals };
  }

  // --- CRUD: leads ---
  router.get('/api/admin/leads', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var rows=await db.all('SELECT * FROM leads ORDER BY created_at DESC'); res.json({ leads:rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/leads', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('leads'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildInsert('leads',data); var r=await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM leads WHERE id=$1',[r.lastInsertRowid]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/leads/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('leads'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildUpdate('leads',data,req.params.id); await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM leads WHERE id=$1',[req.params.id]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/leads/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ await db.run('DELETE FROM leads WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); }
  });

  // --- CRUD: testimonials ---
  router.get('/api/admin/testimonials', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var rows=await db.all('SELECT * FROM testimonials ORDER BY created_at DESC'); res.json({ testimonials:rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/testimonials', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('testimonials'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildInsert('testimonials',data); var r=await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM testimonials WHERE id=$1',[r.lastInsertRowid]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/testimonials/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('testimonials'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildUpdate('testimonials',data,req.params.id); await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM testimonials WHERE id=$1',[req.params.id]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/testimonials/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ await db.run('DELETE FROM testimonials WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); }
  });

  // --- CRUD: posts ---
  router.get('/api/admin/posts', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var rows=await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts:rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/posts', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('posts'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildInsert('posts',data); var r=await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM posts WHERE id=$1',[r.lastInsertRowid]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/posts/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('posts'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildUpdate('posts',data,req.params.id); await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/posts/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); }
  });

  router.post('/api/admin/generate-image', async function(req,res){ if(!apiAdmin(req,res))return; try{ var prompt=req.body.prompt; var ar=req.body.aspectRatio||'16:9'; if(!prompt) return res.status(400).json({ error:'prompt' }); var url=await services.ai.generateImage(prompt, { aspectRatio:ar }); res.json({ imageUrl:url }); }catch(e){ console.error('genimg', e); res.status(500).json({ error:'La génération a échoué. Téléversez une image manuellement.' }); } });

  // ══ Cercle de courtiers — invitation, espace privé, page publique ══════
  //
  // Membership lifecycle: invited → active (paid) → expired/cancelled.
  // A broker may edit and preview their page at ANY status; only `active`
  // + published makes the public page reachable and lead capture live.
  // Payment is a PayPal subscription; PAYPAL_* come from the tenant's secure
  // API-variable store, never from generated code or public settings.

  var BROKER_COOKIE = 'vv_courtier';
  var BROKER_TOKEN_TTL_H = 72;
  var PRICE_BASE = 599;
  var TAX_GST = 0.05;
  var TAX_QST = 0.09975;
  function priceLines(){
    var gst = Math.round(PRICE_BASE * TAX_GST * 100) / 100;
    var qst = Math.round(PRICE_BASE * TAX_QST * 100) / 100;
    return { base: PRICE_BASE, gst: gst, qst: qst, total: Math.round((PRICE_BASE + gst + qst) * 100) / 100 };
  }

  function invoiceIssuer(){
    return {
      name: String(services.externalVars.VENDVITE_LEGAL_NAME || 'Liasse Technologique').trim(),
      address: String(services.externalVars.VENDVITE_BILLING_ADDRESS || 'Québec, Canada').trim(),
      email: String(services.externalVars.VENDVITE_BILLING_EMAIL || 'notifications@liasse.tech').trim(),
      gst: String(services.externalVars.VENDVITE_GST_NUMBER || '').trim(),
      qst: String(services.externalVars.VENDVITE_QST_NUMBER || '').trim()
    };
  }

  // Paths the broker-slug catch-all must never swallow.
  var RESERVED_SLUGS = ['api','admin','acces','espace','journal','public','manifest.json','sw.js','favicon.ico','robots.txt','_platform','__preview','courtier','courtiers','index'];

  function slugifyPart(s){
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  async function uniqueBrokerSlug(name, agency){
    var base = [slugifyPart(name), slugifyPart(agency)].filter(Boolean).join('-') || 'courtier';
    if (RESERVED_SLUGS.indexOf(base) !== -1) base = base + '-courtier';
    var candidate = base, n = 1;
    while (true) {
      var hit = await db.get('SELECT id FROM brokers WHERE slug=$1', [candidate]);
      if (!hit) return candidate;
      n++;
      candidate = base + '-' + n;
    }
  }

  function brokerHasRealAccess(b){
    if (!b || ['active','cancelled'].indexOf(b.status) === -1) return false;
    if (!b.membership_expires_at) return false;
    return new Date(b.membership_expires_at).getTime() > Date.now();
  }
  function brokerHasSandboxAccess(b){
    if (!b || Number(b.paypal_sandbox_active) !== 1 || !b.paypal_sandbox_expires_at) return false;
    return new Date(b.paypal_sandbox_expires_at).getTime() > Date.now();
  }
  async function brokerAccessState(b, forcedMode){
    var mode = await currentPaypalMode(forcedMode);
    var realActive = brokerHasRealAccess(b);
    var sandboxActive = mode === 'sandbox' && brokerHasSandboxAccess(b);
    return {
      mode: mode,
      realActive: realActive,
      sandboxActive: sandboxActive,
      active: realActive || sandboxActive,
      testAccess: !realActive && sandboxActive
    };
  }
  async function brokerPageLive(b, forcedMode){
    var access = await brokerAccessState(b, forcedMode);
    return access.active && Number(b.published) === 1;
  }

  function brokerProfile(b){
    var p = {};
    try { p = (b && b.profile) ? (typeof b.profile === 'string' ? JSON.parse(b.profile) : b.profile) : {}; } catch(e){ p = {}; }
    return p || {};
  }

  async function logBrokerEvent(brokerId, kind, detail){
    try { await db.run('INSERT INTO broker_events (broker_id,kind,detail) VALUES ($1,$2,$3)', [brokerId, kind, (detail || '').slice(0, 500)]); } catch(e){}
  }

  function absoluteUrl(req, path){
    try { if (typeof req.tenantUrl === 'function') return req.tenantUrl(path); } catch(e){}
    var proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0];
    return proto + '://' + req.get('host') + (path.charAt(0) === '/' ? path : '/' + path);
  }

  // ── Magic-link tokens (hash-at-rest; the raw token only ever exists in the email)
  async function mintBrokerToken(brokerId, purpose){
    var raw = services.crypto.randomBytes(32);
    var hash = services.crypto.sha256(raw);
    var expires = new Date(Date.now() + BROKER_TOKEN_TTL_H * 3600 * 1000).toISOString();
    await db.run('INSERT INTO broker_tokens (broker_id,token_hash,purpose,expires_at) VALUES ($1,$2,$3,$4)', [brokerId, hash, purpose || 'access', expires]);
    return raw;
  }

  async function consumeBrokerToken(raw){
    if (!raw || typeof raw !== 'string' || raw.length < 20) return null;
    var hash = services.crypto.sha256(raw);
    var row = await db.get('SELECT * FROM broker_tokens WHERE token_hash=$1', [hash]);
    if (!row) return null;
    if (row.used_at) return null;
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;
    await db.run('UPDATE broker_tokens SET used_at=NOW() WHERE id=$1', [row.id]);
    return await db.get('SELECT * FROM brokers WHERE id=$1', [row.broker_id]);
  }

  // ── Broker session: signed cookie (HMAC over id, keyed by the platform JWT secret)
  function signBrokerSession(id){
    var payload = String(id) + '.' + Date.now();
    var sig = require('crypto').createHmac('sha256', services.jwtSecret || 'vv').update(payload).digest('hex').slice(0, 32);
    return payload + '.' + sig;
  }
  function readBrokerSession(raw){
    if (!raw) return null;
    var parts = String(raw).split('.');
    if (parts.length !== 3) return null;
    var payload = parts[0] + '.' + parts[1];
    var expect = require('crypto').createHmac('sha256', services.jwtSecret || 'vv').update(payload).digest('hex').slice(0, 32);
    var a = Buffer.from(parts[2]);
    var b = Buffer.from(expect);
    if (a.length !== b.length || !require('crypto').timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(parts[1]) > 30 * 24 * 3600 * 1000) return null;
    return Number(parts[0]);
  }

  async function currentBroker(req){
    var id = readBrokerSession(req.cookies ? req.cookies[BROKER_COOKIE] : null);
    if (!id) return null;
    return await db.get('SELECT * FROM brokers WHERE id=$1', [id]);
  }

  async function requireBroker(req, res){
    var b = await currentBroker(req);
    if (!b) { res.redirect('acces-expire'); return null; }
    return b;
  }
  async function requireBrokerApi(req, res){
    var b = await currentBroker(req);
    if (!b) { res.status(401).json({ error: 'session' }); return null; }
    return b;
  }

  // ── Invitation email
  async function sendInviteEmail(req, broker, rawToken, lang){
    var link = absoluteUrl(req, '/acces/' + rawToken) + '?vue=apercu';
    var fr = (lang !== 'en');
    var subject = fr ? 'Votre invitation VendVite' : 'Your VendVite invitation';
    var pageUrl = absoluteUrl(req, '/' + broker.slug);
    var html = ''
      + '<div style="background:#0D0A0B;padding:34px 20px;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">'
      + '<div style="max-width:520px;margin:0 auto;background:linear-gradient(165deg,#171213,#0f0b0c);border:1px solid rgba(245,239,230,.12);border-radius:10px;padding:32px 28px;color:#F5EFE6">'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#C79A5B;margin-bottom:18px">'
      + (fr ? 'Sur invitation seulement' : 'By invitation only') + '</div>'
      + '<h1 style="font-family:Georgia,serif;font-size:25px;line-height:1.15;margin:0 0 14px;color:#F5EFE6">'
      + (fr ? 'Voici votre page, ' : 'Here is your page, ') + escapeHtml(broker.full_name.split(' ')[0]) + '.</h1>'
      + '<p style="color:rgba(245,239,230,.64);font-size:15px;line-height:1.6;margin:0 0 22px">'
      + (fr
        ? 'Votre place dans le cercle VendVite est réservée. Le lien ci-dessous ouvre votre page exactement telle qu\'un propriétaire la verrait. Le bouton au bas de l\'écran vous fait passer en mode édition — rien n\'est public tant que vous ne publiez pas.'
        : 'Your place in the VendVite circle is reserved. The link below opens your page exactly as a homeowner would see it. Use the button at the bottom of the screen to edit it — nothing is public until you publish.')
      + '</p>'
      + '<a href="' + link + '" style="display:block;text-align:center;padding:16px;border-radius:4px;background:#E30B2D;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold;font-size:16px;box-shadow:inset 0 0 0 1.5px rgba(199,154,91,.5)">'
      + (fr ? 'Voir ma page' : 'See my page') + '</a>'
      + '<p style="color:rgba(245,239,230,.34);font-size:12.5px;line-height:1.6;margin:20px 0 0">'
      + (fr ? 'Votre adresse réservée : ' : 'Your reserved address: ') + '<span style="color:#C79A5B">' + pageUrl + '</span><br>'
      + (fr ? 'Ce lien est personnel et expire dans 72 heures.' : 'This link is personal and expires in 72 hours.')
      + '</p></div></div>';
    var text = (fr ? 'Votre page privée VendVite : ' : 'Your private VendVite page: ') + link;
    return await services.email.send({ to: broker.email, subject: subject, html: html, text: text });
  }

  // Acknowledgement to the applicant — no link, the review is human.
  async function sendAckEmail(req, broker, lang){
    var fr = (lang !== 'en');
    var html = ''
      + '<div style="background:#0D0A0B;padding:34px 20px;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">'
      + '<div style="max-width:520px;margin:0 auto;background:linear-gradient(165deg,#171213,#0f0b0c);border:1px solid rgba(245,239,230,.12);border-radius:10px;padding:32px 28px;color:#F5EFE6">'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#C79A5B;margin-bottom:18px">'
      + (fr ? 'Sur invitation seulement' : 'By invitation only') + '</div>'
      + '<h1 style="font-family:Georgia,serif;font-size:24px;line-height:1.2;margin:0 0 14px;color:#F5EFE6">'
      + (fr ? 'Votre demande est scellée, ' : 'Your request is sealed, ') + escapeHtml(broker.full_name.split(' ')[0]) + '.</h1>'
      + '<p style="color:rgba(245,239,230,.64);font-size:15px;line-height:1.6;margin:0">'
      + (fr
        ? 'Pour préserver la rareté — et l’efficacité — de la méthode VendVite, nous limitons volontairement le nombre de licences offertes dans chaque marché. Nous vérifions maintenant si une place additionnelle peut être ouverte dans votre secteur. Si oui, vous recevrez par courriel une offre d’accès ainsi que les modalités pour réserver votre licence.'
        : 'To protect the scarcity — and effectiveness — of the VendVite method, we deliberately limit the number of licences offered in each market. We are now checking whether an additional seat can be opened in your territory. If so, you will receive an access offer by email along with the terms for securing your licence.')
      + '</p></div></div>';
    return await services.email.send({
      to: broker.email,
      subject: fr ? 'Votre demande d’accès VendVite est reçue' : 'Your VendVite access request was received',
      html: html,
      text: fr
        ? 'Votre demande d’accès VendVite est reçue. Nous limitons le nombre de licences par marché afin de préserver l’efficacité de notre méthode. Nous vous écrirons si une place additionnelle peut être ouverte dans votre secteur.'
        : 'Your VendVite access request was received. We limit licences per market to protect the effectiveness of our method. We will contact you if an additional seat can be opened in your territory.'
    });
  }

  // Ping the vendvite operator that a candidature awaits review.
  async function sendOwnerNewApplicationEmail(req, broker){
    var to = (services.config && (services.config.contactEmail || services.config.ownerEmail)) || null;
    if (!to) return { skipped: true };
    var esc = escapeHtml;
    var adminUrl = absoluteUrl(req, '/admin/courtiers');
    var html = ''
      + '<div style="background:#0D0A0B;padding:30px 20px;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">'
      + '<div style="max-width:520px;margin:0 auto;background:linear-gradient(165deg,#171213,#0f0b0c);border:1px solid rgba(245,239,230,.12);border-radius:10px;padding:28px;color:#F5EFE6">'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#C79A5B;margin-bottom:14px">Nouvelle candidature</div>'
      + '<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px">' + esc(broker.full_name) + '</h1>'
      + '<table style="width:100%;border-collapse:collapse;font-size:14px">'
      + [['Agence', broker.agency], ['Secteur ou région visé', broker.target_region], ['Courriel', broker.email], ['Téléphone', formatPhone(broker.phone)], ['Page réservée', '/' + broker.slug]]
          .filter(function(r){ return r[1]; })
          .map(function(r){ return '<tr><td style="padding:7px 0;color:rgba(245,239,230,.42);width:38%">' + esc(r[0]) + '</td><td style="padding:7px 0;color:#F5EFE6">' + esc(r[1]) + '</td></tr>'; }).join('')
      + '</table>'
      + '<a href="' + adminUrl + '" style="display:block;text-align:center;margin-top:22px;padding:14px;border-radius:4px;background:#E30B2D;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold">Examiner la candidature</a>'
      + '</div></div>';
    return await services.email.send({
      to: to,
      subject: 'Nouvelle candidature — ' + broker.full_name,
      html: html,
      text: 'Nouvelle candidature: ' + broker.full_name + ' (' + (broker.agency || '') + ')\nSecteur ou région visé: ' + (broker.target_region || '') + '\n' + adminUrl
    });
  }

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  // ── POST /api/courtier/candidature — the homepage form
  router.post('/api/courtier/candidature', async function(req, res){
    try{
      var b = req.body || {};
      var lang = req.lang || 'fr';
      var TT = T[lang] || T.fr;
      var name = String(b.name || '').trim().slice(0, 120);
      var agency = String(b.agency || '').trim().slice(0, 120);
      var targetRegion = String(b.target_region || '').trim().slice(0, 200);
      var phone = String(b.phone || '').trim().slice(0, 40);
      var email = String(b.email || '').trim().toLowerCase().slice(0, 190);
      if (!name || !agency || !targetRegion || !phone || !email) return res.status(400).json({ error: TT.inv_err_required });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: TT.inv_err_email });

      var existing = await db.get('SELECT * FROM brokers WHERE LOWER(email)=$1', [email]);
      if (existing) {
        await db.run('UPDATE brokers SET target_region=$1, updated_at=NOW() WHERE id=$2', [targetRegion, existing.id]);
        existing.target_region = targetRegion;
        // Same generic answer whatever the state — never leak enrolment.
        if (existing.status === 'invited' || existing.status === 'active' || existing.status === 'cancelled' || existing.status === 'expired') {
          // Already past review: a fresh access link is genuinely helpful.
          var reToken = await mintBrokerToken(existing.id, 'access');
          try { await sendInviteEmail(req, existing, reToken, lang); } catch(e){ console.error('invite resend', e); }
          await logBrokerEvent(existing.id, 'invite_resent', email);
        } else {
          await logBrokerEvent(existing.id, 'reapplied', email);
        }
        return res.json({ success: true, message: TT.inv_done_text });
      }

      var slug = await uniqueBrokerSlug(name, agency);
      var ins = await db.get(
        'INSERT INTO brokers (slug,full_name,agency,phone,email,target_region,status,profile) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [slug, name, agency, phone, email, targetRegion, 'applied', JSON.stringify({
          agent_name: name,
          agency: agency,
          agent_phone: phone,
          agent_email: email,
          hero_title: null,
          links: []
        })]
      );
      // Manual review gate: NO magic link yet. The broker gets a sealed
      // acknowledgement; the vendvite operator gets pinged to review.
      try { await sendAckEmail(req, ins, lang); } catch(e){ console.error('ack email', e); }
      try { await sendOwnerNewApplicationEmail(req, ins); } catch(e){ console.error('owner notify', e); }
      await logBrokerEvent(ins.id, 'applied', agency + ' / ' + targetRegion + ' / ' + email);
      res.json({ success: true, message: TT.inv_done_text, slug: slug });
    }catch(e){
      console.error('candidature', e);
      var TT2 = T[req.lang || 'fr'] || T.fr;
      res.status(500).json({ error: TT2.inv_err_generic });
    }
  });

  // ── GET /acces/:token — magic link lands here, opens the private space
  router.get('/acces/:token', async function(req, res){
    try{
      var broker = await consumeBrokerToken(req.params.token);
      if (!broker) return res.redirect('../acces-expire');
      res.cookie(BROKER_COOKIE, signBrokerSession(broker.id), {
        httpOnly: true, sameSite: 'lax', secure: true, maxAge: 30 * 24 * 3600 * 1000
      });
      await db.run('UPDATE brokers SET last_seen_at=NOW() WHERE id=$1', [broker.id]);
      await logBrokerEvent(broker.id, 'access_link_used', '');
      // Une invitation mene a l'apercu : on montre la page avant la console.
      var vue = (req.query && req.query.vue === 'apercu') ? '../espace/apercu' : '../espace';
      res.redirect(vue);
    }catch(e){ console.error('acces', e); res.redirect('../acces-expire'); }
  });


  // ── Expired / invalid magic link
  router.get('/acces-expire', async function(req, res){
    var L = await baseLocals(req);
    res.status(410).render('acces-expire', Object.assign(L, { isHome: false }));
  });

  // ── Broker private space
  async function espaceLocals(req, broker){
    var L = await baseLocals(req);
    var leads = await db.all('SELECT * FROM broker_leads WHERE broker_id=$1 ORDER BY created_at DESC LIMIT 200', [broker.id]);
    var counts = await db.get("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='nouveau')::int AS fresh, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int AS recent FROM broker_leads WHERE broker_id=$1", [broker.id]);
    var invoices = await db.all('SELECT * FROM broker_invoices WHERE broker_id=$1 ORDER BY payment_time DESC, id DESC LIMIT 20', [broker.id]);
    var activePaypal = await paypalCfg();
    var access = await brokerAccessState(broker, activePaypal.mode);
    var campagnes = await db.all("SELECT id, kind, status, payment_status, centre_label, quantity, address_count, city, total_cents, is_test, deadline_at, mailed_at, created_at FROM broker_campaigns WHERE broker_id=$1 AND NOT (kind='paid' AND payment_status='pending' AND created_at < NOW() - INTERVAL '2 hours') ORDER BY created_at DESC LIMIT 24", [broker.id]);
    var quota = await campagneQuota(broker);
    var paliers = [];
    for (var pi = 1; pi <= CAMPAGNE_PALIERS_MAX; pi++) {
      var pq = pi * CAMPAGNE_PALIER;
      // Calcules AVEC le credit courant : le client ne refait jamais l'arrondi
      // des taxes, il lit la meme valeur que le serveur facturera.
      var pp = prixCampagne(pq, quota.creditPortes);
      paliers.push({ quantite: pq, offert: pp.offert, facturable: pp.facturable, sousTotal: pp.sousTotal, tps: pp.tps, tvq: pp.tvq, total: pp.total });
    }
    var cfgPaypal = await paypalCfg();
    return Object.assign(L, {
      isHome: false,
      campagnes: campagnes || [],
      campQuota: quota,
      campCible: CAMPAGNE_CIBLE,
      campHeures: CAMPAGNE_HEURES,
      campPalier: CAMPAGNE_PALIER,
      campMax: CAMPAGNE_MAX,
      campPaliers: paliers,
      campPrixCents: CAMPAGNE_PRIX_CENTS,
      campPeutPayer: paypalPeutEncaisser(cfgPaypal),
      campModePaypal: cfgPaypal.mode,
      broker: broker,
      profile: brokerProfile(broker),
      leads: leads || [],
      counts: counts || { total: 0, fresh: 0, recent: 0 },
      invoices: invoices || [],
      isActive: access.active,
      isRealActive: access.realActive,
      isTestAccess: access.testAccess,
      isLive: access.active && Number(broker.published) === 1,
      price: priceLines(),
      paymentConfirmed: req.query && req.query.paiement === 'confirme',
      paymentTest: req.query && req.query.paiement === 'test',
      paypalMode: activePaypal.mode,
      paypalConfigured: paypalReady(activePaypal),
      pageUrl: absoluteUrl(req, '/' + broker.slug)
    });
  }

  router.get('/espace', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    try{
      await db.run('UPDATE brokers SET last_seen_at=NOW() WHERE id=$1', [broker.id]);
      res.render('espace', await espaceLocals(req, broker));
    }catch(e){ console.error('espace', e); res.status(500).send('Erreur'); }
  });

  // Live preview of the broker's own page, regardless of published/paid state.
  router.get('/espace/apercu', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    try{ await renderBrokerPage(req, res, broker, true); }
    catch(e){ console.error('apercu', e); res.status(500).send('Erreur'); }
  });

  // Monochrome, print-ready acquisition letter. The QR is generated on the
  // server so every copy points to this broker's exact VendVite page.
  router.get('/espace/lettre-proprietaires', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    try{
      var profile = brokerProfile(broker);
      var pageUrl = absoluteUrl(req, '/' + broker.slug);
      var qrDataUrl = await services.qrcode.toDataURL(pageUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 720,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      res.set('Cache-Control', 'private, no-store');
      // La lettre est desormais bilingue : sans baseLocals elle n'a pas de t et
      // la vue leve une ReferenceError des la premiere cle.
      var L = await baseLocals(req);
      // La lettre s'imprime recto-verso : une face par langue. On passe les DEUX
      // dictionnaires, avec les surcharges de l'operateur appliquees a chacun.
      var settingsL = await getSettings();
      var TL = {
        fr: applyTextOverrides(Object.assign({}, T.fr), settingsL, 'fr'),
        en: applyTextOverrides(Object.assign({}, T.en), settingsL, 'en')
      };
      res.render('lettre-proprietaires', Object.assign(L, {
        TL: TL,
        // Dans l'apercu integre au panneau, la barre d'impression n'a pas de
        // sens : on montre la feuille seule.
        embed: !!(req.query && req.query._embed === '1'),
        broker: broker,
        profile: profile,
        pageUrl: pageUrl,
        qrDataUrl: qrDataUrl,
        formatPhone: formatPhone
      }));
    }catch(e){ console.error('lettre proprietaires', e); res.status(500).send('Erreur'); }
  });

  // Optional done-for-you Canada Post campaign request. Nothing is charged
  // here; the operator receives the exact quantity, territory and estimate.
  router.post('/api/espace/campagne-postale', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var access = await brokerAccessState(broker);
      if (!(access.active && Number(broker.published) === 1)) {
        return res.status(409).json({ code: 'PAGE_NOT_LIVE' });
      }
      var quantity = Math.floor(Number(req.body && req.body.quantity));
      var sector = String((req.body && req.body.sector) || '').trim().slice(0, 300);
      var notes = String((req.body && req.body.notes) || '').trim().slice(0, 1000);
      if (!Number.isFinite(quantity) || quantity < 300 || quantity > 100000) {
        return res.status(400).json({ error: 'quantity', code: 'MINIMUM_300' });
      }
      if (!sector) return res.status(400).json({ error: 'sector', code: 'SECTOR_REQUIRED' });

      var total = Math.round(quantity * 159) / 100;
      var ownerEmail = (services.config && (services.config.contactEmail || services.config.ownerEmail)) || null;
      var detail = JSON.stringify({ quantity: quantity, sector: sector, notes: notes, total: total, test: access.testAccess });
      await logBrokerEvent(broker.id, access.testAccess?'sandbox_postal_campaign_requested':'postal_campaign_requested', detail);

      if (ownerEmail) {
        var esc = escapeHtml;
        var html = ''
          + '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:28px;color:#171717">'
          + '<p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#777">' + (access.testAccess?'TEST SANDBOX · ':'') + 'Campagne Courrier de précision</p>'
          + '<h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 18px">Nouvelle demande de ' + quantity.toLocaleString('fr-CA') + ' adresses</h1>'
          + '<table style="width:100%;border-collapse:collapse;font-size:14px">'
          + [['Courtier', broker.full_name], ['Agence', broker.agency], ['Courriel', broker.email], ['Téléphone', formatPhone(broker.phone)], ['Secteur visé', sector], ['Quantité', quantity.toLocaleString('fr-CA')], ['Estimation', total.toFixed(2).replace('.', ',') + ' $']]
            .map(function(r){ return '<tr><td style="padding:8px;border-bottom:1px solid #ddd;color:#777;width:32%">' + esc(r[0]) + '</td><td style="padding:8px;border-bottom:1px solid #ddd">' + esc(r[1] || '') + '</td></tr>'; }).join('')
          + (notes ? '<p style="margin-top:18px"><strong>Précisions :</strong><br>' + esc(notes).replace(/\n/g, '<br>') + '</p>' : '')
          + '<p style="margin-top:20px;color:#777;font-size:12px">Estimation à 1,59 $ par lettre postée. Cette demande ne constitue pas encore une commande facturée.</p>'
          + '</div>';
        await services.email.send({
          to: ownerEmail,
          replyTo: broker.email,
          subject: (access.testAccess?'[TEST SANDBOX] ':'') + 'VendVite — campagne postale de ' + quantity + ' adresses — ' + broker.full_name,
          html: html,
          text: 'Campagne postale VendVite\nCourtier: ' + broker.full_name + '\nSecteur: ' + sector + '\nQuantité: ' + quantity + '\nEstimation: ' + total.toFixed(2) + ' $\nNotes: ' + notes
        });
      }
      res.json({ success: true, quantity: quantity, total: total });
    }catch(e){ console.error('campagne postale', e); res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/espace/profil', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var incoming = req.body && typeof req.body === 'object' ? req.body : {};
      var current = brokerProfile(broker);
      var ALLOWED = ['agent_name','agency','agent_phone','agent_email','agent_title','agent_photo_url','hero_title','hero_sub','hero_note','about','agency_disclaimer','stat_homes','stat_days','stat_ratio','stat_volume','links','testimonials'];
      var next = Object.assign({}, current);
      ALLOWED.forEach(function(k){
        if (!(k in incoming)) return;
        var v = incoming[k];
        if (k === 'links') {
          if (!Array.isArray(v)) return;
          next.links = v.slice(0, 12).map(function(l){
            return {
              label: String((l && l.label) || '').slice(0, 40),
              url: String((l && l.url) || '').slice(0, 300)
            };
          }).filter(function(l){ return l.label && /^https?:\/\//i.test(l.url); });
          return;
        }
        if (k === 'testimonials') {
          if (!Array.isArray(v)) return;
          next.testimonials = v.slice(0, 12).map(function(x){
            return {
              author: String((x && x.author) || '').slice(0, 80),
              neighborhood: String((x && x.neighborhood) || '').slice(0, 80),
              quote: String((x && x.quote) || '').slice(0, 600),
              sale_result: String((x && x.sale_result) || '').slice(0, 80)
            };
          }).filter(function(x){ return x.author && x.quote; });
          return;
        }
        next[k] = v == null ? null : String(v).slice(0, 1200);
      });
      await db.run('UPDATE brokers SET profile=$1, updated_at=NOW() WHERE id=$2', [JSON.stringify(next), broker.id]);
      await logBrokerEvent(broker.id, 'profile_saved', '');
      res.json({ success: true, profile: next });
    }catch(e){ console.error('profil', e); res.status(500).json({ error: 'server' }); }
  });

  // Photo upload → Cloudinary, scoped to this broker's folder.
  router.post('/api/espace/photo', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var dataUrl = (req.body && req.body.image) || '';
      if (!/^data:image\/(png|jpe?g|webp);base64,/.test(dataUrl)) return res.status(400).json({ error: 'format' });
      if (dataUrl.length > 8 * 1024 * 1024) return res.status(413).json({ error: 'taille' });
      var up = await services.cloudinary.uploader.upload(dataUrl, {
        folder: 'vendvite_courtiers/' + broker.slug,
        public_id: 'portrait',
        overwrite: true,
        resource_type: 'image'
      });
      var url = (up && (up.secure_url || up.url)) || '';
      if (!url) return res.status(502).json({ error: 'upload' });
      var prof = brokerProfile(broker);
      prof.agent_photo_url = url;
      await db.run('UPDATE brokers SET profile=$1, updated_at=NOW() WHERE id=$2', [JSON.stringify(prof), broker.id]);
      res.json({ success: true, url: url });
    }catch(e){ console.error('photo', e); res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/espace/publier', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    var want = req.body && req.body.published === false ? 0 : 1;
    var access = await brokerAccessState(broker);
    if (want === 1 && !access.active) {
      return res.status(402).json({ error: 'abonnement', code: 'PAYMENT_REQUIRED' });
    }
    try{
      await db.run('UPDATE brokers SET published=$1, updated_at=NOW() WHERE id=$2', [want, broker.id]);
      await logBrokerEvent(broker.id, want ? 'published' : 'unpublished', '');
      res.json({ success: true, published: want === 1 });
    }catch(e){ console.error('publier', e); res.status(500).json({ error: 'server' }); }
  });

  router.get('/api/espace/leads', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var rows = await db.all('SELECT * FROM broker_leads WHERE broker_id=$1 ORDER BY created_at DESC LIMIT 500', [broker.id]);
      res.json({ leads: rows || [] });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  router.put('/api/espace/leads/:id', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var owned = await db.get('SELECT id FROM broker_leads WHERE id=$1 AND broker_id=$2', [req.params.id, broker.id]);
      if (!owned) return res.status(404).json({ error: 'introuvable' });
      var status = req.body && req.body.status ? String(req.body.status).slice(0, 40) : null;
      var notes = req.body && req.body.notes != null ? String(req.body.notes).slice(0, 4000) : null;
      await db.run('UPDATE broker_leads SET status=COALESCE($1,status), notes=COALESCE($2,notes), updated_at=NOW() WHERE id=$3', [status, notes, req.params.id]);
      res.json({ success: true });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });


  // ── Campagne « 150 portes » ────────────────────────────────────────────────
  //    Le navigateur du courtier interroge lui-meme OpenStreetMap (Nominatim +
  //    Overpass) et nous transmet la liste deja constituee. Le serveur ne fait
  //    jamais cet appel sortant : l'IP de sortie est partagee par toute la
  //    flotte et Overpass n'accorde que deux creneaux par IP — une requete
  //    serveur bloquerait les autres locataires et depasserait le plafond
  //    d'origine de Cloudflare. Ici on valide, on borne et on conserve.

  // 72 heures ouvrables : on saute samedi et dimanche — au fuseau du QUEBEC,
  // pas en UTC. Un vendredi 21 h a Montreal est deja samedi en UTC, et compter
  // en UTC avancait donc l'echeance d'une journee entiere.
  function jourQuebec(d){
    try{ return new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/Toronto', weekday: 'short' }); }
    catch(e){ return ''; }
  }
  function echeanceOuvrable(heures){
    var d = new Date();
    var restant = heures;
    while (restant > 0) {
      d = new Date(d.getTime() + 3600000);
      var j = jourQuebec(d);
      if (j !== 'Sat' && j !== 'Sun') restant--;
    }
    return d;
  }

  // Prix d'une campagne payante. Calcul EN AVANT en cents entiers : la fonction
  // taxBreakdown d'invoice.js retro-deduit le partage a partir du total et
  // diverge d'un cent sur les gros volumes, ce qui ferait mentir la facture.
  function prixCampagne(quantite, credit){
    var offert = Math.max(0, Math.min(Number(credit) || 0, quantite));
    var facturable = quantite - offert;
    var sous = facturable * CAMPAGNE_PRIX_CENTS;
    var tps = Math.round(sous * 0.05);
    var tvq = Math.round(sous * 0.09975);
    return { quantite: quantite, offert: offert, facturable: facturable, sousTotal: sous, tps: tps, tvq: tvq, total: sous + tps + tvq };
  }

  // L'ancre de l'annee d'adhesion. membership_started_at est NULL pour tout
  // courtier active a la main ou en bac a sable — c'est le cas des deux
  // courtiers en production — et sans repli le quota « une par annee » devenait
  // silencieusement « une a vie ».
  function anneeAdhesion(broker){
    var ancre = broker.membership_started_at || broker.created_at;
    var debut = ancre ? new Date(ancre) : null;
    if (!debut || isNaN(debut.getTime())) return null;
    var maintenant = new Date();
    var borne = new Date(debut.getTime());
    while (borne.getTime() <= maintenant.getTime()) borne.setUTCFullYear(borne.getUTCFullYear() + 1);
    borne.setUTCFullYear(borne.getUTCFullYear() - 1);
    return borne;
  }

  // Une commande payante abandonnee ne doit jamais retenir la campagne incluse.
  // On libere ici plutot que d'attendre un geste du courtier : la reservation
  // n'existe que pour empecher une double depense pendant le paiement.
  async function libererCampagnesExpirees(broker){
    try{
      await db.run(
        "UPDATE broker_campaigns SET status='cancelled', payment_status='cancelled', quota_period=NULL, updated_at=NOW() " +
        "WHERE broker_id=$1 AND kind='paid' AND payment_status='pending' AND created_at < NOW() - INTERVAL '" + CAMPAGNE_RESERVE_MIN + " minutes'",
        [broker.id]
      );
    }catch(e){ /* la liberation est opportuniste : jamais bloquante */ }
  }

  function periodeCourante(broker){
    var depuis = anneeAdhesion(broker);
    return depuis ? new Date(depuis).toISOString().slice(0, 10) : null;
  }

  async function campagneQuota(broker){
    await libererCampagnesExpirees(broker);
    var depuis = anneeAdhesion(broker);
    var periode = periodeCourante(broker);
    // quota_period marque la reservation, qu'elle soit portee par la campagne
    // incluse ou par une commande payante qui consomme le credit.
    var row = periode
      ? await db.get("SELECT COUNT(*)::int AS n FROM broker_campaigns WHERE broker_id=$1 AND quota_period=$2 AND status<>'cancelled' AND is_test=0", [broker.id, periode])
      : await db.get("SELECT COUNT(*)::int AS n FROM broker_campaigns WHERE broker_id=$1 AND quota_period IS NOT NULL AND status<>'cancelled' AND is_test=0", [broker.id]);
    var utilisees = (row && row.n) || 0;
    return {
      utilisees: utilisees,
      incluses: CAMPAGNE_PAR_AN,
      restantes: Math.max(0, CAMPAGNE_PAR_AN - utilisees),
      creditPortes: utilisees < CAMPAGNE_PAR_AN ? CAMPAGNE_CIBLE : 0,
      depuis: depuis,
      periode: periode
    };
  }

  // Une adresse arrive du navigateur : on ne fait confiance a rien.
  function assainirAdresse(a){
    if (!a || typeof a !== 'object') return null;
    var numero = String(a.numero == null ? '' : a.numero).trim().slice(0, 20);
    var rue = String(a.rue == null ? '' : a.rue).trim().slice(0, 160);
    if (!numero || !rue) return null;
    var lat = Number(a.lat), lng = Number(a.lng);
    return {
      numero: numero,
      rue: rue,
      ville: String(a.ville == null ? '' : a.ville).trim().slice(0, 120),
      source: a.source === 'point' ? 'point' : 'interpole',
      lat: Number.isFinite(lat) ? Math.round(lat * 1e6) / 1e6 : null,
      lng: Number.isFinite(lng) ? Math.round(lng * 1e6) / 1e6 : null,
      metres: Number.isFinite(Number(a.metres)) ? Math.max(0, Math.round(Number(a.metres))) : null
    };
  }

  router.post('/api/espace/campagne', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var access = await brokerAccessState(broker);
      if (!access.active) return res.status(409).json({ code: 'MEMBERSHIP_REQUIRED' });
      if (Number(broker.published) !== 1) return res.status(409).json({ code: 'PAGE_NOT_LIVE' });

      // On LIT le verrou ici mais on ne l'arme qu'apres l'enregistrement : il
      // existe pour empecher une campagne en double, pas pour punir une faute
      // de frappe. L'armer avant la validation bloquerait 20 s un courtier qui
      // vient simplement de se tromper d'adresse.
      var precedent = campagneDerniere.get(broker.id) || 0;
      if (new Date().getTime() - precedent < CAMPAGNE_DELAI_MS) return res.status(429).json({ code: 'TOO_FAST' });

      var quota = await campagneQuota(broker);
      if (quota.restantes <= 0) return res.status(409).json({ code: 'QUOTA_SPENT' });

      var corps = req.body && typeof req.body === 'object' ? req.body : {};
      var centre = corps.centre && typeof corps.centre === 'object' ? corps.centre : {};
      var libelle = String(centre.libelle == null ? '' : centre.libelle).trim().slice(0, 300);
      var cLat = Number(centre.lat), cLng = Number(centre.lng);
      if (!libelle || !Number.isFinite(cLat) || !Number.isFinite(cLng)) {
        return res.status(400).json({ code: 'CENTRE_REQUIRED' });
      }

      var brutes = Array.isArray(corps.adresses) ? corps.adresses : [];
      if (brutes.length > CAMPAGNE_MAX) return res.status(400).json({ code: 'TOO_MANY' });
      var vues = Object.create(null);
      var adresses = [];
      for (var i = 0; i < brutes.length; i++) {
        var a = assainirAdresse(brutes[i]);
        if (!a) continue;
        var cle = (a.numero + '|' + a.rue).toLowerCase();
        if (vues[cle]) continue;
        vues[cle] = 1;
        adresses.push(a);
      }
      if (adresses.length < 1) return res.status(400).json({ code: 'NO_ADDRESSES' });

      var ville = String(corps.ville == null ? '' : corps.ville).trim().slice(0, 120);
      var notes = String(corps.notes == null ? '' : corps.notes).trim().slice(0, 1000);
      var rayon = Math.max(0, Math.min(5000, Math.round(Number(corps.rayon) || 0)));
      var echeance = echeanceOuvrable(CAMPAGNE_HEURES);

      // Une promesse de 72 h sans destinataire cote operateur serait un mensonge :
      // on refuse plutot que de repondre « recu » dans le vide.
      var ownerEmail = (services.config && (services.config.contactEmail || services.config.ownerEmail)) || null;
      if (!ownerEmail) return res.status(500).json({ error: 'server', code: 'NO_OPERATOR' });

      if (adresses.length > CAMPAGNE_CIBLE) return res.status(400).json({ code: 'TOO_MANY' });
      // quota_period + l'index unique partiel font respecter le quota par la
      // BASE. Le COUNT plus haut n'est qu'une politesse : deux confirmations
      // simultanees le passeraient toutes les deux, et la Map en memoire ne vit
      // que dans un seul processus.
      var periode = quota.periode;
      var campagne;
      try{
        campagne = await db.get(
          'INSERT INTO broker_campaigns (broker_id,kind,status,payment_status,centre_label,centre_lat,centre_lng,radius_m,quantity,address_count,addresses,city,notes,is_test,quota_period,deadline_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *',
          [broker.id, 'included', 'confirmed', 'none', libelle, cLat, cLng, rayon, adresses.length, adresses.length, JSON.stringify(adresses), ville, notes, access.testAccess ? 1 : 0, periode, echeance]
        );
      }catch(err){
        if (String(err && err.code) === '23505') return res.status(409).json({ code: 'QUOTA_SPENT' });
        throw err;
      }

      campagneDerniere.set(broker.id, new Date().getTime());

      await logBrokerEvent(broker.id, access.testAccess ? 'sandbox_campaign_confirmed' : 'campaign_confirmed',
        JSON.stringify({ id: campagne.id, n: adresses.length, centre: libelle.slice(0, 120) }));

      await envoyerCampagneOperateur(req, broker, campagne, adresses, access.testAccess);

      var apres = await campagneQuota(broker);
      res.json({ success: true, id: campagne.id, count: adresses.length, deadline: echeance.toISOString(), restantes: apres.restantes });
    }catch(e){ console.error('campagne', e); res.status(500).json({ error: 'server' }); }
  });



  // Le courriel a l'operateur : une seule implementation pour la campagne
  // incluse et les campagnes payantes, sinon les deux divergent.
  async function envoyerCampagneOperateur(req, broker, campagne, adresses, estTest){
    var ownerEmail = (services.config && (services.config.contactEmail || services.config.ownerEmail)) || null;
    if (!ownerEmail) throw new Error('no operator email');
    var esc = escapeHtml;
    var liste = Array.isArray(adresses) ? adresses : [];
    var lignes = liste.slice(0, 12).map(function(a){ return esc(a.numero + ' ' + a.rue); }).join('<br>');
    var reste = liste.length - Math.min(12, liste.length);
    var csvUrl = absoluteUrl(req, '/admin/campagnes/' + campagne.id + '/adresses.csv');
    var echeance = campagne.deadline_at ? new Date(campagne.deadline_at) : new Date();
    var paye = campagne.kind === 'paid';
    var marque = estTest ? 'TEST SANDBOX · ' : '';
    var rangs = [['Courtier', broker.full_name], ['Agence', broker.agency], ['Courriel', broker.email], ['Téléphone', formatPhone(broker.phone)], ['Centre du territoire', campagne.centre_label], ['Ville', campagne.city], ['Rayon', (campagne.radius_m || 0) + ' m'], ['Adresses', String(campagne.address_count)]];
    if (paye) rangs.push(['Payé', campagneMontantTexte(campagne.total_cents || 0) + (estTest ? ' (sandbox — aucun argent réel)' : '')]);
    else rangs.push(['Facturation', 'Incluse dans la licence']);
    rangs.push(['Page du courtier', absoluteUrl(req, '/' + broker.slug)]);

    var html = ''
      + '<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:28px;color:#171717">'
      + '<p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#777">' + marque + (paye ? 'Campagne payée' : 'Campagne incluse') + '</p>'
      + '<h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 8px">' + campagne.address_count + ' adresses à poster</h1>'
      + '<p style="margin:0 0 18px;font-size:14px;color:#b45309"><strong>Dépôt à Postes Canada avant le ' + echeance.toLocaleString('fr-CA', { dateStyle: 'full', timeStyle: 'short' }) + '.</strong></p>'
      + '<table style="width:100%;border-collapse:collapse;font-size:14px">'
      + rangs.map(function(r){ return '<tr><td style="padding:8px;border-bottom:1px solid #ddd;color:#777;width:34%">' + esc(r[0]) + '</td><td style="padding:8px;border-bottom:1px solid #ddd">' + esc(r[1] || '') + '</td></tr>'; }).join('')
      + '</table>'
      + (campagne.notes ? '<p style="margin-top:18px"><strong>Précisions :</strong><br>' + esc(campagne.notes).replace(/\n/g, '<br>') + '</p>' : '')
      + '<p style="margin-top:20px;font-size:14px"><strong>Aperçu :</strong><br>' + lignes + (reste > 0 ? '<br><em>… et ' + reste + ' autres</em>' : '') + '</p>'
      + '<p style="margin-top:20px"><a href="' + csvUrl + '" style="background:#171717;color:#fff;padding:11px 18px;border-radius:6px;text-decoration:none;font-size:14px">Télécharger le CSV des adresses</a></p>'
      + '<p style="margin-top:18px;color:#777;font-size:12px">Les codes postaux ne sont pas fournis par la source cartographique : ils doivent être complétés avant le dépôt. Les adresses marquées « interpolé » sont déduites d\'une plage municipale et peuvent inclure un numéro inexistant.</p>'
      + '</div>';

    await services.email.send({
      to: ownerEmail,
      replyTo: broker.email,
      subject: (estTest ? '[TEST SANDBOX] ' : '') + 'VendVite — campagne ' + campagne.address_count + ' portes — ' + broker.full_name,
      html: html,
      text: (estTest ? '[TEST SANDBOX] ' : '') + 'Campagne VendVite\nCourtier: ' + broker.full_name + '\nCentre: ' + (campagne.centre_label || '') + '\nAdresses: ' + campagne.address_count + '\nDepot avant: ' + echeance.toISOString() + '\nCSV: ' + csvUrl
    });
  }

  // Facture d'une campagne payante. Les montants sont ceux calcules EN AVANT a
  // la commande — on ne repasse pas par taxBreakdown, qui retro-deduit et
  // diverge d'un cent sur les gros volumes.
  async function facturerCampagne(req, broker, campagne, capture, mode){
    try{
      var captureId = capture && capture.id ? capture.id : ('order:' + campagne.paypal_order_id);
      var cle = 'campagne:' + mode + ':' + captureId;
      var deja = await db.get('SELECT id FROM broker_invoices WHERE payment_key=$1', [cle]);
      if (deja) return deja;
      var quand = new Date();
      var row = await db.get(
        'INSERT INTO broker_invoices (broker_id,kind,campaign_id,payment_key,paypal_order_id,paypal_transaction_id,payment_time,subtotal_cents,gst_cents,qst_cents,total_cents,currency,is_test,paypal_mode) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
        [broker.id, 'campagne', campagne.id, cle, campagne.paypal_order_id, capture && capture.id ? capture.id : null, quand, campagne.subtotal_cents, campagne.gst_cents, campagne.qst_cents, campagne.total_cents, 'CAD', mode === 'sandbox' ? 1 : 0, mode]
      );
      await db.run('UPDATE broker_invoices SET invoice_number=$1 WHERE id=$2 AND invoice_number IS NULL',
        [invoiceTools.invoiceNumber(row.id, quand, mode === 'sandbox'), row.id]);
      return row;
    }catch(e){ console.error('facture campagne', e); return null; }
  }

  // ── Campagnes payantes (paliers de 150) ────────────────────────────────────
  //    Achat unique : PayPal Orders v2, pas Subscriptions. La ligne est ecrite
  //    AVANT l'appel a PayPal pour qu'un paiement capture ne puisse jamais
  //    exister sans campagne correspondante, et l'index unique sur
  //    paypal_order_id rend une capture rejouee inoffensive.

  function campagneMontantTexte(cents){
    return (cents / 100).toFixed(2).replace('.', ',') + ' $';
  }

  router.post('/api/espace/campagne/commander', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var access = await brokerAccessState(broker);
      if (!access.active) return res.status(409).json({ code: 'MEMBERSHIP_REQUIRED' });
      if (Number(broker.published) !== 1) return res.status(409).json({ code: 'PAGE_NOT_LIVE' });

      var corps = req.body && typeof req.body === 'object' ? req.body : {};
      var quantite = Math.floor(Number(corps.quantite));
      if (!Number.isFinite(quantite) || quantite < CAMPAGNE_PALIER || quantite > CAMPAGNE_MAX || quantite % CAMPAGNE_PALIER !== 0) {
        return res.status(400).json({ code: 'BAD_QUANTITY' });
      }

      var centre = corps.centre && typeof corps.centre === 'object' ? corps.centre : {};
      var libelle = String(centre.libelle == null ? '' : centre.libelle).trim().slice(0, 300);
      var cLat = Number(centre.lat), cLng = Number(centre.lng);
      if (!libelle || !Number.isFinite(cLat) || !Number.isFinite(cLng)) {
        return res.status(400).json({ code: 'CENTRE_REQUIRED' });
      }

      var brutes = Array.isArray(corps.adresses) ? corps.adresses : [];
      if (brutes.length > CAMPAGNE_MAX) return res.status(400).json({ code: 'TOO_MANY' });
      var vues = Object.create(null);
      var adresses = [];
      for (var i = 0; i < brutes.length; i++) {
        var a = assainirAdresse(brutes[i]);
        if (!a) continue;
        var cle = (a.numero + '|' + a.rue).toLowerCase();
        if (vues[cle]) continue;
        vues[cle] = 1;
        adresses.push(a);
      }
      // On facture un nombre de portes : livrer moins que le nombre paye serait
      // un vol, en livrer plus serait offert. On refuse plutot que d'ajuster.
      if (adresses.length !== quantite) {
        return res.status(400).json({ code: 'COUNT_MISMATCH', trouvees: adresses.length, requises: quantite });
      }

      var c = await paypalCfg();
      if (!paypalPeutEncaisser(c)) return res.status(503).json({ error: 'paypal_absent', code: 'NOT_CONFIGURED' });

      // La campagne incluse s'applique en credit sur n'importe quelle taille de
      // commande : 450 portes avec credit se facturent 300.
      var quota = await campagneQuota(broker);
      var credit = quota.creditPortes;
      var prix = prixCampagne(quantite, credit);
      if (prix.facturable <= 0) return res.status(400).json({ code: 'USE_INCLUDED' });
      var ville = String(corps.ville == null ? '' : corps.ville).trim().slice(0, 120);
      var notes = String(corps.notes == null ? '' : corps.notes).trim().slice(0, 1000);
      var rayon = Math.max(0, Math.min(5000, Math.round(Number(corps.rayon) || 0)));
      var estTest = c.mode === 'sandbox' ? 1 : 0;

      // On RESERVE le credit des la creation de la commande : sans cela deux
      // paiements simultanes le depenseraient tous les deux et la contrainte
      // ne sauterait qu'apres l'encaissement. La reservation est relachee a
      // l'annulation, et d'office au bout d'une heure.
      // Une commande en bac a sable ne reserve RIEN : le quota et l'index
      // ignorent deja is_test=1, mais on evite d'ecrire une reservation qui
      // ment sur elle-meme et deviendrait reelle si le predicat changeait.
      var periodeCredit = (credit > 0 && !estTest) ? quota.periode : null;

      // Relancer un territoire deja enregistre ne doit pas en creer une copie.
      // On reprend la ligne existante quand elle est encore modifiable : par
      // identifiant si le navigateur l'a rechargee, sinon en reconnaissant une
      // cible identique (meme centre, meme quantite, meme nombre d'adresses)
      // parmi les commandes non payees.
      var repriseId = Math.floor(Number(corps.reprend)) || 0;
      var existante = repriseId
        ? await db.get("SELECT id FROM broker_campaigns WHERE id=$1 AND broker_id=$2 AND payment_status<>'paid' AND status<>'mailed'", [repriseId, broker.id])
        : await db.get(
            "SELECT id FROM broker_campaigns WHERE broker_id=$1 AND kind='paid' AND payment_status<>'paid' AND status<>'mailed' AND centre_label=$2 AND quantity=$3 AND address_count=$4 ORDER BY id DESC LIMIT 1",
            [broker.id, libelle, quantite, adresses.length]
          );

      var campagne;
      try{
        if (existante) {
          campagne = await db.get(
            "UPDATE broker_campaigns SET kind='paid', status='pending_payment', payment_status='pending', centre_label=$1, centre_lat=$2, centre_lng=$3, radius_m=$4, quantity=$5, address_count=$6, addresses=$7, city=$8, notes=$9, subtotal_cents=$10, gst_cents=$11, qst_cents=$12, total_cents=$13, paypal_mode=$14, is_test=$15, quota_period=$16, paypal_order_id=NULL, paypal_capture_id=NULL, updated_at=NOW() WHERE id=$17 RETURNING *",
            [libelle, cLat, cLng, rayon, quantite, adresses.length, JSON.stringify(adresses), ville, notes, prix.sousTotal, prix.tps, prix.tvq, prix.total, c.mode, estTest, periodeCredit, existante.id]
          );
        } else {
          campagne = await db.get(
            'INSERT INTO broker_campaigns (broker_id,kind,status,payment_status,centre_label,centre_lat,centre_lng,radius_m,quantity,address_count,addresses,city,notes,subtotal_cents,gst_cents,qst_cents,total_cents,paypal_mode,is_test,quota_period) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *',
            [broker.id, 'paid', 'pending_payment', 'pending', libelle, cLat, cLng, rayon, quantite, adresses.length, JSON.stringify(adresses), ville, notes, prix.sousTotal, prix.tps, prix.tvq, prix.total, c.mode, estTest, periodeCredit]
          );
        }
      }catch(err){
        if (String(err && err.code) === '23505') return res.status(409).json({ code: 'QUOTA_SPENT' });
        throw err;
      }

      var retour = absoluteUrl(req, '/espace/campagne/retour') + '?mode=' + c.mode;
      var annule = absoluteUrl(req, '/espace/campagne/retour') + '?mode=' + c.mode + '&annule=1';
      var token = await paypalToken(c);
      var r = await services.fetch(c.base + '/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': 'vvc-' + campagne.id
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            // Namespace obligatoire : le webhook d'abonnement lit custom_id et
            // reactiverait l'adhesion si on y mettait juste l'id du courtier.
            custom_id: 'camp:' + broker.id + ':' + campagne.id,
            description: quantite + ' lettres VendVite',
            amount: {
              currency_code: 'CAD',
              value: (prix.total / 100).toFixed(2),
              breakdown: {
                item_total: { currency_code: 'CAD', value: (prix.sousTotal / 100).toFixed(2) },
                tax_total: { currency_code: 'CAD', value: ((prix.tps + prix.tvq) / 100).toFixed(2) }
              }
            }
          }],
          application_context: {
            brand_name: 'VendVite',
            locale: (req.lang === 'en' ? 'en-CA' : 'fr-CA'),
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            return_url: retour,
            cancel_url: annule
          }
        })
      });
      var j = await r.json();
      if (!r.ok || !j.id) {
        await db.run("UPDATE broker_campaigns SET status='cancelled', payment_status='failed', updated_at=NOW() WHERE id=$1", [campagne.id]);
        console.error('campagne order', j && j.message);
        return res.status(502).json({ error: 'paypal', code: 'ORDER_FAILED' });
      }
      await db.run('UPDATE broker_campaigns SET paypal_order_id=$1, updated_at=NOW() WHERE id=$2', [j.id, campagne.id]);

      var approuver = (j.links || []).filter(function(l){ return l.rel === 'approve' || l.rel === 'payer-action'; })[0];
      if (!approuver) return res.status(502).json({ error: 'paypal', code: 'NO_APPROVE_LINK' });
      res.json({ success: true, id: campagne.id, mode: c.mode, total: prix.total, offert: prix.offert, facturable: prix.facturable, approve: approuver.href });
    }catch(e){ console.error('commander', e); res.status(500).json({ error: 'server' }); }
  });

  // Relacher une commande non payee : la campagne incluse redevient disponible
  // immediatement. C'est la porte de sortie manuelle — rien ne reste coince.
  async function libererCampagne(brokerId, campagneId){
    var r = await db.run(
      "UPDATE broker_campaigns SET status='cancelled', payment_status='cancelled', quota_period=NULL, updated_at=NOW() " +
      "WHERE id=$1 AND broker_id=$2 AND payment_status='pending'",
      [campagneId, brokerId]
    );
    return !!(r && r.changes);
  }

  // Recharger le territoire d'une campagne NON PAYEE : le courtier retrouve
  // exactement ce qu'il avait avant d'appuyer sur payer, y compris apres un
  // abandon chez PayPal ou sur un autre appareil. La liste vit deja en base.
  router.get('/api/espace/campagne/:id/territoire', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var c = await db.get(
        "SELECT * FROM broker_campaigns WHERE id=$1 AND broker_id=$2 AND payment_status<>'paid' AND status<>'mailed'",
        [Math.floor(Number(req.params.id)) || 0, broker.id]
      );
      if (!c) return res.status(404).json({ code: 'NOT_EDITABLE' });
      res.json({
        centre: { libelle: c.centre_label, lat: c.centre_lat, lng: c.centre_lng },
        quantite: c.quantity || c.address_count,
        rayon: c.radius_m || 0,
        ville: c.city || '',
        notes: c.notes || '',
        adresses: c.addresses || []
      });
    }catch(e){ console.error('territoire', e); res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/espace/campagne/:id/annuler', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var libere = await libererCampagne(broker.id, Math.floor(Number(req.params.id)) || 0);
      if (!libere) return res.status(409).json({ code: 'NOT_PENDING' });
      await logBrokerEvent(broker.id, 'campaign_released', String(req.params.id));
      var apres = await campagneQuota(broker);
      res.json({ success: true, restantes: apres.restantes });
    }catch(e){ console.error('annuler campagne', e); res.status(500).json({ error: 'server' }); }
  });

  async function finaliserCampagnePayee(req, broker, campagne, c){
    var token = await paypalToken(c);
    var base = c.base + '/v2/checkout/orders/' + encodeURIComponent(campagne.paypal_order_id);
    var lu = await services.fetch(base, { headers: { 'Authorization': 'Bearer ' + token } });
    var ordre = await lu.json();
    if (!lu.ok) return null;

    var capture = null;
    if (ordre.status === 'APPROVED') {
      var cap = await services.fetch(base + '/capture', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'PayPal-Request-Id': 'vvcap-' + campagne.id },
        body: '{}'
      });
      ordre = await cap.json();
    }
    if (ordre.status !== 'COMPLETED') return null;
    try{
      capture = ordre.purchase_units[0].payments.captures[0];
    }catch(e){ capture = null; }

    // L'index unique sur paypal_order_id et ce garde-fou rendent une capture
    // rejouee (retour du navigateur + webhook) sans effet.
    var frais = await db.get("SELECT payment_status FROM broker_campaigns WHERE id=$1", [campagne.id]);
    if (frais && frais.payment_status === 'paid') return campagne;

    var echeance = echeanceOuvrable(CAMPAGNE_HEURES);
    await db.run(
      "UPDATE broker_campaigns SET status='confirmed', payment_status='paid', paypal_capture_id=$1, deadline_at=$2, updated_at=NOW() WHERE id=$3",
      [capture ? capture.id : null, echeance, campagne.id]
    );
    await logBrokerEvent(broker.id, c.mode === 'sandbox' ? 'sandbox_campaign_paid' : 'campaign_paid',
      JSON.stringify({ id: campagne.id, n: campagne.address_count, cents: campagne.total_cents }));

    var frais2 = Object.assign({}, campagne, { deadline_at: echeance });
    await envoyerCampagneOperateur(req, broker, frais2, campagne.addresses || [], c.mode === 'sandbox');
    await facturerCampagne(req, broker, frais2, capture, c.mode);
    return frais2;
  }

  router.get('/espace/campagne/retour', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    var mode = req.query && req.query.mode === 'sandbox' ? 'sandbox' : 'live';
    var etat = 'verification';
    try{
      if (req.query && req.query.annule) {
        etat = 'annule';
        var jetonA = String((req.query && req.query.token) || '').slice(0, 64);
        var enCours = jetonA
          ? await db.get("SELECT id FROM broker_campaigns WHERE paypal_order_id=$1 AND broker_id=$2 AND payment_status='pending'", [jetonA, broker.id])
          : await db.get("SELECT id FROM broker_campaigns WHERE broker_id=$1 AND kind='paid' AND payment_status='pending' ORDER BY id DESC LIMIT 1", [broker.id]);
        if (enCours) await libererCampagne(broker.id, enCours.id);
      } else {
        // On ne renvoie JAMAIS a PayPal l'identifiant fourni par le navigateur :
        // on s'en sert seulement pour retrouver une ligne DEJA possedee par la
        // session courante, sinon un courtier pourrait reclamer la commande d'un autre.
        var jeton = String((req.query && req.query.token) || '').slice(0, 64);
        var campagne = jeton
          ? await db.get("SELECT * FROM broker_campaigns WHERE paypal_order_id=$1 AND broker_id=$2 AND kind='paid'", [jeton, broker.id])
          : await db.get("SELECT * FROM broker_campaigns WHERE broker_id=$1 AND kind='paid' AND payment_status='pending' ORDER BY id DESC LIMIT 1", [broker.id]);
        if (campagne && campagne.paypal_order_id) {
          var c = await paypalCfg(campagne.paypal_mode || mode);
          if (paypalPeutEncaisser(c)) {
            var fini = await finaliserCampagnePayee(req, broker, campagne, c);
            if (fini) etat = (c.mode === 'sandbox' ? 'test' : 'paye');
          }
        }
      }
    }catch(e){ console.error('campagne retour', e); }
    res.redirect('../../espace?campagne=' + etat);
  });

  // ── Operateur : lire et livrer les campagnes. Sans cette surface, la promesse
  //    de 72 h porterait sur des donnees qu'aucun humain ne peut recuperer.
  router.get('/admin/campagnes', requireAdmin, async function(req, res){
    var L = await baseLocals(req);
    var campagnes = await db.all('SELECT c.*, b.full_name, b.agency, b.email AS broker_email, b.phone AS broker_phone, b.slug FROM broker_campaigns c JOIN brokers b ON b.id=c.broker_id ORDER BY c.created_at DESC LIMIT 200');
    var cc = { confirmed: 0, mailed: 0 };
    (campagnes || []).forEach(function(c){ if (c.status === 'confirmed') cc.confirmed++; else if (c.status === 'mailed') cc.mailed++; });
    res.render('admin-campagnes', Object.assign(L, { active: 'campagnes', campagnes: campagnes || [], cc: cc }));
  });

  router.get('/admin/campagnes/:id/adresses.csv', requireAdmin, async function(req, res){
    var c = await db.get('SELECT c.*, b.full_name, b.slug FROM broker_campaigns c JOIN brokers b ON b.id=c.broker_id WHERE c.id=$1', [req.params.id]);
    if (!c) return res.status(404).send('Introuvable');
    // Les valeurs viennent du navigateur du courtier. Une cellule commencant par
    // = + - @ ou une tabulation est EXECUTEE comme formule par Excel : on la
    // prefixe d'une apostrophe. Les guillemets seuls ne protegent pas.
    var cell = function(v){
      var s = String(v == null ? '' : v);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    var lignes = ['distance_m,house_number,street,city,province,postal_code,source'];
    (c.addresses || []).forEach(function(a){
      lignes.push([a.metres == null ? '' : a.metres, a.numero, a.rue, a.ville || c.city || '', c.province || 'QC', '', a.source].map(cell).join(','));
    });
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="campagne-' + c.id + '-' + c.slug + '.csv"');
    res.send('\uFEFF' + lignes.join('\n') + '\n');
  });

  // Levier operateur : annuler n'importe quelle campagne et rendre au courtier
  // sa campagne incluse, meme une commande payante restee en travers.
  router.post('/api/admin/campagnes/:id/annuler', async function(req, res){
    if (!apiAdmin(req, res)) return;
    try{
      var c = await db.get('SELECT * FROM broker_campaigns WHERE id=$1', [req.params.id]);
      if (!c) return res.status(404).json({ error: 'introuvable' });
      await db.run("UPDATE broker_campaigns SET status='cancelled', payment_status=CASE WHEN payment_status='paid' THEN 'paid' ELSE 'cancelled' END, quota_period=NULL, updated_at=NOW() WHERE id=$1", [c.id]);
      await logBrokerEvent(c.broker_id, 'campaign_voided_by_operator', String(c.id));
      res.json({ success: true });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/admin/campagnes/:id/postee', async function(req, res){
    if (!apiAdmin(req, res)) return;
    try{
      var c = await db.get('SELECT * FROM broker_campaigns WHERE id=$1', [req.params.id]);
      if (!c) return res.status(404).json({ error: 'introuvable' });
      var vise = c.status === 'mailed' ? 'confirmed' : 'mailed';
      await db.run('UPDATE broker_campaigns SET status=$1, mailed_at=$2, updated_at=NOW() WHERE id=$3', [vise, vise === 'mailed' ? new Date() : null, c.id]);
      res.json({ success: true, status: vise });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });


  // ── PayPal subscription ($599/yr + GST + QST). Credentials come from the
  //    tenant's secure API-variable store — never hardcoded.
  //    Mode is selected in /admin/ventes. Live and sandbox credentials are
  //    deliberately separate so a test can never reach a production account.
  async function readAdminSetting(key){
    try{ var row=await db.get('SELECT value FROM admin_settings WHERE key=$1',[key]); return String(row&&row.value||'').trim(); }
    catch(e){ return ''; }
  }
  async function saveAdminSetting(key,value){
    await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()',[key,String(value||'').trim()]);
  }
  async function currentPaypalMode(forcedMode){
    var forced=String(forcedMode||'').trim().toLowerCase();
    if(forced==='live'||forced==='sandbox') return forced;
    var saved=await readAdminSetting('paypal_mode');
    var mode=String(saved||services.externalVars.PAYPAL_MODE||'sandbox').trim().toLowerCase();
    return mode==='live'?'live':'sandbox';
  }
  async function paypalCfg(forcedMode){
    // Literal accesses make all six secure fields discoverable in the tenant
    // dashboard. Sandbox never falls back to production credentials.
    var mode=await currentPaypalMode(forcedMode);
    var generatedSandboxPlan=mode==='sandbox'?await readAdminSetting('paypal_sandbox_plan_id'):'';
    return {
      mode: mode,
      base: mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
      clientId: String(mode==='live' ? (services.externalVars.PAYPAL_CLIENT_ID||'') : (services.externalVars.PAYPAL_SANDBOX_CLIENT_ID||'')).trim(),
      secret: String(mode==='live' ? (services.externalVars.PAYPAL_CLIENT_SECRET||'') : (services.externalVars.PAYPAL_SANDBOX_CLIENT_SECRET||'')).trim(),
      planId: String(mode==='live' ? (services.externalVars.PAYPAL_PLAN_ID||'') : (generatedSandboxPlan||services.externalVars.PAYPAL_SANDBOX_PLAN_ID||'')).trim()
    };
  }
  function paypalReady(c){ return !!(c.clientId && c.secret && c.planId); }
  // Un achat unique passe par Orders v2 : il n'a pas de plan. Gater la vente de
  // campagnes sur paypalReady refuserait tout paiement des qu'aucun plan
  // d'abonnement n'existe.
  function paypalPeutEncaisser(c){ return !!(c.clientId && c.secret); }

  async function paypalToken(c){
    var r = await services.fetch(c.base + '/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(c.clientId + ':' + c.secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    if (!r.ok) throw new Error('paypal auth ' + r.status);
    var j = await r.json();
    return j.access_token;
  }

  function paymentSnapshot(subscription, eventResource){
    var billing = subscription && subscription.billing_info;
    var last = billing && billing.last_payment;
    var amount = last && last.amount;
    var eventAmount = eventResource && eventResource.amount;
    var rawValue = amount && amount.value;
    var currency = amount && amount.currency_code;
    if ((!rawValue || !currency) && eventAmount) {
      rawValue = eventAmount.total || eventAmount.value;
      currency = eventAmount.currency || eventAmount.currency_code;
    }
    var at = (last && last.time) || (eventResource && (eventResource.create_time || eventResource.update_time));
    var parsed = new Date(at || 0);
    var totalCents = Math.round(Number(rawValue) * 100);
    if (!Number.isFinite(parsed.getTime()) || !Number.isFinite(totalCents) || totalCents <= 0) return null;
    return {
      time: parsed.toISOString(),
      totalCents: totalCents,
      currency: String(currency || 'CAD').toUpperCase().slice(0, 3),
      transactionId: eventResource && eventResource.id ? String(eventResource.id).slice(0, 80) : null
    };
  }

  function invoicePeriodEnd(subscription, paymentTime){
    var next = subscription && subscription.billing_info && subscription.billing_info.next_billing_time;
    var nextDate = new Date(next || 0);
    var paidAt = new Date(paymentTime);
    if (Number.isFinite(nextDate.getTime()) && nextDate > paidAt) return nextDate.toISOString();
    return new Date(paidAt.getTime() + 365 * 24 * 3600 * 1000).toISOString();
  }

  async function emailBrokerInvoice(req, broker, invoice){
    if (!invoice || invoice.emailed_at) return invoice;
    var issuer = invoiceIssuer();
    var pdf = invoiceTools.buildInvoicePdf(invoice, broker, issuer);
    var firstName = String(broker.full_name || '').split(' ')[0] || 'Courtier';
    var invoiceUrl = absoluteUrl(req, '/espace/factures/' + invoice.id + '/pdf');
    var total = invoiceTools.money(invoice.total_cents);
    var isTest = Number(invoice.is_test) === 1 || invoice.is_test === true;
    var html = ''
      + '<div style="background:#0D0A0B;padding:34px 20px;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">'
      + '<div style="max-width:540px;margin:0 auto;background:#171213;border:1px solid rgba(245,239,230,.14);border-radius:10px;padding:32px 28px;color:#F5EFE6">'
      + '<div style="font-family:monospace;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#C79A5B;margin-bottom:16px">' + (isTest?'Test PayPal réussi':'Paiement confirmé') + '</div>'
      + '<h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.15;margin:0 0 14px">' + (isTest?'Le parcours sandbox fonctionne, ':'Votre licence VendVite est active, ') + escapeHtml(firstName) + '.</h1>'
      + '<p style="color:rgba(245,239,230,.66);font-size:15px;line-height:1.6;margin:0 0 18px">' + (isTest?'Aucun paiement réel n’a été encaissé. Votre accès d’essai est maintenant ouvert pour publier la page et vérifier tout le parcours. La facture test ':'Nous avons reçu votre paiement annuel de <strong style="color:#F5EFE6">'+escapeHtml(total)+'</strong>. Votre facture ') + '<strong style="color:#C79A5B">' + escapeHtml(invoice.invoice_number) + '</strong> est jointe à ce courriel et demeure disponible dans votre espace.</p>'
      + '<table style="width:100%;border-collapse:collapse;margin:20px 0;color:#F5EFE6;font-size:14px">'
      + '<tr><td style="padding:9px 0;border-bottom:1px solid rgba(245,239,230,.1);color:rgba(245,239,230,.45)">Abonnement</td><td style="padding:9px 0;border-bottom:1px solid rgba(245,239,230,.1);text-align:right">599,00 $ + taxes</td></tr>'
      + '<tr><td style="padding:9px 0;color:rgba(245,239,230,.45)">' + (isTest?'Total simulé':'Total payé') + '</td><td style="padding:9px 0;text-align:right;font-weight:700">' + escapeHtml(total) + '</td></tr>'
      + '</table>'
      + '<a href="' + invoiceUrl + '" style="display:block;text-align:center;padding:15px;border-radius:4px;background:#E30B2D;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold">Télécharger ma facture</a>'
      + '<p style="color:rgba(245,239,230,.4);font-size:12px;line-height:1.55;margin:18px 0 0">' + (isTest?'Document de test sans valeur comptable. Cet accès fonctionne uniquement pendant que PayPal est en mode sandbox.':'Votre page reste sous votre contrôle : ouvrez votre espace pour la publier lorsque vous êtes prêt.') + '</p>'
      + '</div></div>';
    var result = await services.email.send({
      to: broker.email,
      subject: (isTest?'[TEST PAYPAL] ':'') + 'Votre facture VendVite ' + invoice.invoice_number,
      html: html,
      text: isTest ? 'Test PayPal réussi. Aucun paiement réel. Votre accès d’essai est ouvert pour publier la page et tester le parcours complet en mode sandbox. Facture test '+invoice.invoice_number+', total simulé '+total+'. Télécharger : '+invoiceUrl : 'Paiement confirmé. Votre licence VendVite est active. Facture ' + invoice.invoice_number + ', total payé ' + total + '. Télécharger : ' + invoiceUrl,
      attachments: [{
        content: pdf.toString('base64'),
        filename: invoice.invoice_number + '.pdf',
        type: 'application/pdf',
        disposition: 'attachment'
      }]
    });
    if (!result || result.success !== false) {
      await db.run('UPDATE broker_invoices SET emailed_at=NOW() WHERE id=$1', [invoice.id]);
      invoice.emailed_at = new Date().toISOString();
    }
    return invoice;
  }

  async function issueInvoiceForPayment(req, broker, subscription, eventResource, mode){
    if (!subscription || subscription.status !== 'ACTIVE') return null;
    var payment = paymentSnapshot(subscription, eventResource);
    if (!payment) return null;
    mode = mode === 'sandbox' ? 'sandbox' : 'live';
    var isTest = mode === 'sandbox';
    var subId = String(subscription.id || (isTest ? broker.paypal_sandbox_subscription_id : broker.paypal_subscription_id) || '');
    if (!subId) return null;
    var paymentKey = mode + ':' + subId + ':' + payment.time;
    var invoice = await db.get('SELECT * FROM broker_invoices WHERE payment_key=$1', [paymentKey]);
    if (!invoice) {
      // Return redirects and PayPal webhooks can report the same payment a few
      // seconds apart. Collapse them even if their timestamps differ slightly.
      invoice = await db.get(
        "SELECT * FROM broker_invoices WHERE paypal_subscription_id=$1 AND paypal_mode=$2 AND total_cents=$3 AND ABS(EXTRACT(EPOCH FROM (payment_time-$4::timestamptz))) < 600 ORDER BY id DESC LIMIT 1",
        [subId, mode, payment.totalCents, payment.time]
      );
    }
    if (!invoice) {
      var tax = invoiceTools.taxBreakdown(payment.totalCents);
      var periodEnd = invoicePeriodEnd(subscription, payment.time);
      invoice = await db.get(
        'INSERT INTO broker_invoices (broker_id,payment_key,paypal_subscription_id,paypal_transaction_id,payment_time,period_start,period_end,subtotal_cents,gst_cents,qst_cents,total_cents,currency,is_test,paypal_mode) VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (payment_key) DO NOTHING RETURNING *',
        [broker.id, paymentKey, subId, payment.transactionId, payment.time, periodEnd, tax.subtotalCents, tax.gstCents, tax.qstCents, tax.totalCents, payment.currency, isTest?1:0, mode]
      );
      if (!invoice) invoice = await db.get('SELECT * FROM broker_invoices WHERE payment_key=$1', [paymentKey]);
      if (invoice && !invoice.invoice_number) {
        var number = invoiceTools.invoiceNumber(invoice.id, payment.time, isTest);
        invoice = await db.get('UPDATE broker_invoices SET invoice_number=$1 WHERE id=$2 RETURNING *', [number, invoice.id]);
        await logBrokerEvent(broker.id, isTest?'test_invoice_created':'invoice_created', number);
      }
    } else if (!invoice.paypal_transaction_id && payment.transactionId) {
      invoice = await db.get('UPDATE broker_invoices SET paypal_transaction_id=$1 WHERE id=$2 RETURNING *', [payment.transactionId, invoice.id]);
    }
    if (invoice && !invoice.emailed_at) {
      try { await emailBrokerInvoice(req, broker, invoice); }
      catch(e){ console.error('invoice email', e); }
    }
    return invoice;
  }

  router.post('/api/espace/abonnement', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    var c = await paypalCfg();
    if (!paypalReady(c)) return res.status(503).json({ error: 'paypal_absent', code: 'NOT_CONFIGURED' });
    try{
      var token = await paypalToken(c);
      var r = await services.fetch(c.base + '/v1/billing/subscriptions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'PayPal-Request-Id': 'vv-' + broker.id + '-' + Date.now() },
        body: JSON.stringify({
          plan_id: c.planId,
          custom_id: String(broker.id),
          subscriber: {
            name: { given_name: (broker.full_name || '').split(' ')[0] || 'Courtier', surname: (broker.full_name || '').split(' ').slice(1).join(' ') || '.' },
            email_address: broker.email
          },
          application_context: {
            brand_name: 'VendVite',
            locale: (req.lang === 'en' ? 'en-CA' : 'fr-CA'),
            user_action: 'SUBSCRIBE_NOW',
            return_url: absoluteUrl(req, '/espace/abonnement/retour?mode=' + c.mode),
            cancel_url: absoluteUrl(req, '/espace?paiement=annule')
          }
        })
      });
      var j = await r.json();
      if (!r.ok) { console.error('paypal sub', j); return res.status(502).json({ error: 'paypal' }); }
      var approve = (j.links || []).filter(function(l){ return l.rel === 'approve'; })[0];
      if(c.mode==='sandbox') await db.run('UPDATE brokers SET paypal_sandbox_subscription_id=$1, updated_at=NOW() WHERE id=$2', [j.id, broker.id]);
      else await db.run('UPDATE brokers SET paypal_subscription_id=$1, updated_at=NOW() WHERE id=$2', [j.id, broker.id]);
      await logBrokerEvent(broker.id, c.mode==='sandbox'?'sandbox_subscription_created':'subscription_created', j.id);
      res.json({ success: true, approveUrl: approve ? approve.href : null });
    }catch(e){ console.error('abonnement', e); res.status(500).json({ error: 'server' }); }
  });

  async function activateBroker(broker, subscriptionId, detail, paypalPeriodEnd){
    var candidate = new Date(paypalPeriodEnd || 0);
    var until = Number.isFinite(candidate.getTime()) && candidate.getTime() > Date.now()
      ? candidate.toISOString()
      : new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
    await db.run(
      'UPDATE brokers SET status=$1, membership_started_at=COALESCE(membership_started_at,NOW()), membership_expires_at=$2, paypal_subscription_id=COALESCE($3,paypal_subscription_id), updated_at=NOW() WHERE id=$4',
      ['active', until, subscriptionId || null, broker.id]
    );
    await logBrokerEvent(broker.id, 'membership_activated', detail || '');
  }

  async function activateSandboxBroker(broker, subscriptionId, detail, paypalPeriodEnd){
    var candidate = new Date(paypalPeriodEnd || 0);
    var until = Number.isFinite(candidate.getTime()) && candidate.getTime() > Date.now()
      ? candidate.toISOString()
      : new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
    await db.run(
      'UPDATE brokers SET paypal_sandbox_active=1, paypal_sandbox_expires_at=$1, paypal_sandbox_subscription_id=COALESCE($2,paypal_sandbox_subscription_id), updated_at=NOW() WHERE id=$3',
      [until, subscriptionId || null, broker.id]
    );
    await logBrokerEvent(broker.id, 'sandbox_membership_activated', detail || '');
  }

  router.get('/espace/abonnement/retour', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    var mode = req.query && req.query.mode === 'sandbox' ? 'sandbox' : 'live';
    var c = await paypalCfg(mode);
    var subId = req.query.subscription_id || (mode==='sandbox'?broker.paypal_sandbox_subscription_id:broker.paypal_subscription_id);
    var confirmed = false;
    try{
      if (paypalReady(c) && subId) {
        var token = await paypalToken(c);
        var r = await services.fetch(c.base + '/v1/billing/subscriptions/' + encodeURIComponent(subId), {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        var j = await r.json();
        if (r.ok && j.status === 'ACTIVE') {
          var nextBilling = j.billing_info && j.billing_info.next_billing_time;
          if(mode==='live') await activateBroker(broker, subId, 'return:' + j.status, nextBilling);
          else await activateSandboxBroker(broker, subId, 'return:' + j.status, nextBilling);
          await issueInvoiceForPayment(req, broker, j, null, mode);
          confirmed = true;
        }
      }
    }catch(e){ console.error('retour', e); }
    res.redirect('../../espace?paiement=' + (confirmed ? (mode==='sandbox'?'test':'confirme') : 'verification'));
  });

  router.get('/espace/factures/:id/pdf', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    try{
      var invoice = await db.get('SELECT * FROM broker_invoices WHERE id=$1 AND broker_id=$2', [req.params.id, broker.id]);
      if (!invoice) return res.status(404).send('Facture introuvable');
      var pdf = invoiceTools.buildInvoicePdf(invoice, broker, invoiceIssuer());
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="' + invoice.invoice_number + '.pdf"');
      res.setHeader('Cache-Control', 'private, no-store');
      res.send(pdf);
    }catch(e){ console.error('invoice pdf', e); res.status(500).send('Impossible de générer la facture'); }
  });

  router.post('/api/espace/abonnement/annuler', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    var c = await paypalCfg();
    var subId = c.mode==='sandbox' ? broker.paypal_sandbox_subscription_id : broker.paypal_subscription_id;
    try{
      if (paypalReady(c) && subId) {
        var token = await paypalToken(c);
        await services.fetch(c.base + '/v1/billing/subscriptions/' + encodeURIComponent(subId) + '/cancel', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Annulation par le courtier' })
        });
      }
      // A sandbox cancellation is a test only and cannot alter paid access.
      if(c.mode==='live') await db.run("UPDATE brokers SET status='cancelled', updated_at=NOW() WHERE id=$1", [broker.id]);
      await logBrokerEvent(broker.id, c.mode==='sandbox'?'sandbox_subscription_cancelled':'membership_cancelled', '');
      res.json({ success: true });
    }catch(e){ console.error('annuler', e); res.status(500).json({ error: 'server' }); }
  });

  // PayPal webhook. The event itself is UNTRUSTED — anyone can POST here, and
  // a forged BILLING.SUBSCRIPTION.ACTIVATED would otherwise hand out a $599
  // membership for free. So the event is only ever a NUDGE: we re-fetch the
  // subscription from PayPal and act solely on the status PayPal reports.
  router.post('/api/paypal/webhook', async function(req, res){
    try{
      var ev = req.body || {};
      var resource = ev.resource || {};
      var subId = resource.billing_agreement_id || resource.id || '';
      var brokerId = resource.custom_id || (resource.subscriber && resource.subscriber.custom_id) || null;
      var broker = null;
      if (subId) broker = await db.get('SELECT * FROM brokers WHERE paypal_subscription_id=$1 OR paypal_sandbox_subscription_id=$1', [subId]);
      if (!broker && brokerId) broker = await db.get('SELECT * FROM brokers WHERE id=$1', [brokerId]);
      if (!broker) return res.json({ received: true });

      var mode = subId && broker.paypal_sandbox_subscription_id === subId ? 'sandbox' : 'live';
      var c = await paypalCfg(mode);
      var lookupId = subId || (mode==='sandbox'?broker.paypal_sandbox_subscription_id:broker.paypal_subscription_id);
      if (!paypalReady(c) || !lookupId) return res.json({ received: true });

      var token = await paypalToken(c);
      var r = await services.fetch(c.base + '/v1/billing/subscriptions/' + encodeURIComponent(lookupId), {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!r.ok) return res.json({ received: true });
      var sub = await r.json();

      // Only PayPal's own answer moves money-bearing state.
      if (sub.status === 'ACTIVE') {
        var nextBilling = sub.billing_info && sub.billing_info.next_billing_time;
        if(mode==='live') await activateBroker(broker, lookupId, 'verified:' + (ev.event_type || 'webhook'), nextBilling);
        else await activateSandboxBroker(broker, lookupId, 'verified:' + (ev.event_type || 'webhook'), nextBilling);
        await issueInvoiceForPayment(req, broker, sub, resource, mode);
      } else if (sub.status === 'CANCELLED') {
        // A cancellation stops renewal, not access already paid for.
        if(mode==='live') await db.run("UPDATE brokers SET status='cancelled', updated_at=NOW() WHERE id=$1", [broker.id]);
        await logBrokerEvent(broker.id, mode==='sandbox'?'sandbox_subscription_cancelled':'membership_cancelled', 'verified:' + sub.status);
      } else if (['EXPIRED', 'SUSPENDED'].indexOf(sub.status) !== -1) {
        if(mode==='live') {
          await db.run("UPDATE brokers SET status='expired', published=0, updated_at=NOW() WHERE id=$1", [broker.id]);
          await logBrokerEvent(broker.id, 'membership_stopped', 'verified:' + sub.status);
        } else {
          await db.run('UPDATE brokers SET paypal_sandbox_active=0, updated_at=NOW() WHERE id=$1', [broker.id]);
          await logBrokerEvent(broker.id, 'sandbox_membership_stopped', 'verified:' + sub.status);
        }
      }
      res.json({ received: true });
    }catch(e){ console.error('paypal webhook', e); res.json({ received: true }); }
  });

  // ── Public broker page. Renders the lead funnel under the broker's identity.
  async function renderBrokerPage(req, res, broker, isPreview){
    var L = await baseLocals(req);
    var prof = brokerProfile(broker);
    var settings = Object.assign({}, L.settings, {
      agent_name: prof.agent_name || broker.full_name,
      agent_phone: prof.agent_phone || broker.phone,
      agent_email: prof.agent_email || broker.email,
      agent_title: prof.agent_title || broker.agency,
      agency: prof.agency || broker.agency,
      _p_agent_image_url: prof.agent_photo_url || L.settings._p_agent_image_url || ''
    });
    var t = Object.assign({}, L.t);
    if (prof.hero_title) t.hero_title = prof.hero_title;
    if (prof.hero_sub) t.hero_sub = prof.hero_sub;
    if (prof.hero_note) t.hero_note = prof.hero_note;
    // Profile keys → the TEMPLATE's real setting keys (the page reads
    // stat_homes_sold / stat_avg_days / stat_list_to_sale / stat_career_volume).
    var STAT_MAP = { stat_homes:'stat_homes_sold', stat_days:'stat_avg_days', stat_ratio:'stat_list_to_sale', stat_volume:'stat_career_volume' };
    Object.keys(STAT_MAP).forEach(function(k){ if (prof[k]) settings[STAT_MAP[k]] = prof[k]; });
    // Identity into the « Votre courtier » section (t-keys, not settings)
    if (prof.agent_title) t.agent_title = prof.agent_title;
    if (prof.agency || broker.agency) t.agent_remax = prof.agency || broker.agency;
    if (prof.about) t.agent_credo = prof.about;
    // La mention legale appartient a l'agence du courtier : aucune marque de
    // banniere ne doit apparaitre sur la page d'un courtier d'une autre banniere.
    if (prof.agency_disclaimer) t.footer_disclaimer = prof.agency_disclaimer;
    // Footer socials are the BROKER's own — never the template's seeded
    // placeholders. Recognized platforms become footer icons; the rest render
    // as link pills; none at all → nothing shows.
    var SOCIAL_RE = { social_facebook:/facebook\.com/i, social_instagram:/instagram\.com/i, social_linkedin:/linkedin\.com/i, social_youtube:/youtu\.?be/i, social_tiktok:/tiktok\.com/i };
    Object.keys(SOCIAL_RE).forEach(function(k){ settings[k] = ''; });
    var otherLinks = [];
    (Array.isArray(prof.links) ? prof.links : []).forEach(function(l){
      var hit = Object.keys(SOCIAL_RE).find(function(k){ return SOCIAL_RE[k].test(l.url) && !settings[k]; });
      if (hit) settings[hit] = l.url; else otherLinks.push(l);
    });
    var testimonials = Array.isArray(prof.testimonials) && prof.testimonials.length
      ? prof.testimonials.map(function(x, i){ return Object.assign({ id: 'p' + i, published: 1, sort_order: i }, x); })
      : await db.all('SELECT * FROM testimonials WHERE published=1 ORDER BY sort_order ASC, created_at DESC');
    var posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
    res.render('broker-page', Object.assign(L, {
      t: t,
      settings: settings,
      testimonials: testimonials || [],
      posts: posts || [],
      isHome: true,
      brokerSlug: broker.slug,
      brokerLinks: otherLinks,
      isPreview: !!isPreview,
      canonical: absoluteUrl(req, '/' + broker.slug)
    }));
  }

  // ── Lead capture from a broker page → broker_leads + instant email
  router.post('/api/courtier/:slug/piste', async function(req, res){
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE slug=$1', [req.params.slug]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      if (!(await brokerPageLive(broker))) return res.status(403).json({ error: 'inactif' });
      var b = req.body || {};
      var name = String(b.name || '').trim().slice(0, 120);
      var address = String(b.address || '').trim().slice(0, 300);
      if (!name || !address) return res.status(400).json({ error: (T[req.lang || 'fr'] || T.fr).err_required });
      var lat = b.lat ? Number(b.lat) : null;
      var lng = b.lng ? Number(b.lng) : null;
      var row = await db.get(
        'INSERT INTO broker_leads (broker_id,name,email,phone,address,lat,lng,timeframe,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [broker.id, name, String(b.email || '').trim().slice(0, 190), String(b.phone || '').trim().slice(0, 40), address,
         isFinite(lat) ? lat : null, isFinite(lng) ? lng : null, String(b.timeframe || '').trim().slice(0, 80), 'nouveau']
      );
      notifyBrokerOfLead(req, broker, row).catch(function(e){ console.error('lead mail', e); });
      res.json({ success: true });
    }catch(e){ console.error('piste', e); res.status(500).json({ error: 'server' }); }
  });

  async function notifyBrokerOfLead(req, broker, lead){
    var fr = true;
    var esc = escapeHtml;
    // The espace « Courriel » field is where pistes land — account email as fallback.
    var leadInbox = (brokerProfile(broker).agent_email || broker.email);
    var rows = [
      ['Nom', lead.name], ['Adresse', lead.address], ['Courriel', lead.email],
      ['Téléphone', lead.phone ? formatPhone(lead.phone) : ''], ['Échéancier', lead.timeframe]
    ].filter(function(r){ return r[1]; });
    var html = ''
      + '<div style="background:#0D0A0B;padding:30px 20px;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">'
      + '<div style="max-width:520px;margin:0 auto;background:linear-gradient(165deg,#171213,#0f0b0c);border:1px solid rgba(245,239,230,.12);border-radius:10px;padding:28px;color:#F5EFE6">'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#C79A5B;margin-bottom:14px">Nouveau lead</div>'
      + '<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 18px">' + esc(lead.name) + '</h1>'
      + '<table style="width:100%;border-collapse:collapse;font-size:14px">'
      + rows.map(function(r){
          return '<tr><td style="padding:7px 0;color:rgba(245,239,230,.42);width:38%">' + esc(r[0]) + '</td>'
            + '<td style="padding:7px 0;color:#F5EFE6">' + esc(r[1]) + '</td></tr>';
        }).join('')
      + '</table>'
      + '<a href="' + absoluteUrl(req, '/espace') + '" style="display:block;text-align:center;margin-top:22px;padding:14px;border-radius:4px;background:#E30B2D;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold">Ouvrir mon espace</a>'
      + '</div></div>';
    return await services.email.send({
      to: leadInbox,
      subject: 'Nouveau lead — ' + lead.name,
      html: html,
      text: 'Nouveau lead: ' + lead.name + ' — ' + lead.address
    });
  }


  // ── Operator: roster + manual activation. Needed because a broker cannot
  //    self-activate until a PayPal plan exists, and for comped accounts.
  router.get('/api/admin/courtiers', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var rows = await db.all(
        'SELECT b.*, (SELECT COUNT(*)::int FROM broker_leads l WHERE l.broker_id=b.id) AS lead_count'
        + ' FROM brokers b ORDER BY b.created_at DESC'
      );
      res.json({ courtiers: rows || [] });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  // Approve a candidature: the manual-review gate opens here and ONLY here —
  // this is what mints the magic link and sends the invitation.
  router.post('/api/admin/courtiers/:id/approuver', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE id=$1', [req.params.id]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      if (broker.status !== 'applied' && broker.status !== 'refused') {
        return res.status(409).json({ error: 'deja_traitee', status: broker.status });
      }
      await db.run("UPDATE brokers SET status='invited', updated_at=NOW() WHERE id=$1", [broker.id]);
      var raw = await mintBrokerToken(broker.id, 'access');
      try { await sendInviteEmail(req, broker, raw, req.lang || 'fr'); }
      catch(e){ console.error('approve invite email', e); return res.status(502).json({ error: 'courriel', approved: true }); }
      await logBrokerEvent(broker.id, 'approved', 'operator');
      res.json({ success: true, status: 'invited' });
    }catch(e){ console.error('approuver', e); res.status(500).json({ error: 'server' }); }
  });

  // Refuse a candidature. Deliberately silent — no rejection email; the
  // operator can reach out personally if they want to.
  router.post('/api/admin/courtiers/:id/refuser', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE id=$1', [req.params.id]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      if (broker.status === 'active') return res.status(409).json({ error: 'actif' });
      await db.run("UPDATE brokers SET status='refused', published=0, updated_at=NOW() WHERE id=$1", [broker.id]);
      await logBrokerEvent(broker.id, 'refused', 'operator');
      res.json({ success: true, status: 'refused' });
    }catch(e){ console.error('refuser', e); res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/admin/courtiers/:id/activer', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE id=$1', [req.params.id]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      var months = Number(req.body && req.body.months) || 12;
      var until = new Date(Date.now() + months * 30.44 * 24 * 3600 * 1000).toISOString();
      await db.run(
        "UPDATE brokers SET status='active', membership_started_at=COALESCE(membership_started_at,NOW()), membership_expires_at=$1, updated_at=NOW() WHERE id=$2",
        [until, broker.id]
      );
      await logBrokerEvent(broker.id, 'membership_activated', 'operator/' + months + 'm');
      res.json({ success: true, expires: until });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/admin/courtiers/:id/relancer', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE id=$1', [req.params.id]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      var raw = await mintBrokerToken(broker.id, 'access');
      await sendInviteEmail(req, broker, raw, req.lang || 'fr');
      await logBrokerEvent(broker.id, 'invite_resent', 'operator');
      res.json({ success: true });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  // ── GET /:slug — a broker's public page. Must remain the LAST route before
  //    the catch-all: it matches any single path segment, so every reserved
  //    platform/app path has to be refused explicitly.
  router.get('/:slug', async function(req, res, next){
    var slug = String(req.params.slug || '');
    if (!slug || RESERVED_SLUGS.indexOf(slug.toLowerCase()) !== -1) return next();
    if (slug.indexOf('.') !== -1) return next();
    if (!/^[a-z0-9-]+$/.test(slug)) return next();
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE slug=$1', [slug]);
      if (!broker) return next();
      // Unpaid or unpublished pages do not exist publicly — the broker reaches
      // their own draft through /espace/apercu instead.
      if (!(await brokerPageLive(broker))) {
        var me = await currentBroker(req);
        if (!me || me.id !== broker.id) return next();
      }
      await renderBrokerPage(req, res, broker, false);
    }catch(e){ console.error('broker page', e); next(); }
  });


  router.use(function(req,res){
    if(req.method==='GET'){
      if(req.path.indexOf('/api')===0) return res.status(404).json({ error:'not found' });
      if(req.path.indexOf('/admin')===0) return res.status(404).send('Introuvable');
      return res.redirect('.');
    }
    res.status(404).json({ error:'not found' });
  });
  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
  // Only matches GET requests — POST/PUT/DELETE API endpoints are unaffected
  router.get('*', (req, res, next) => {
    // Don't redirect API calls — return 404 JSON instead
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Let admin paths fall through to the platform's admin fallback handler
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
      return next();
    }
    res.redirect('./');
  });


  return router;
};
