/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PageData } from '../types/pageData';
import avatarImg from '../assets/images/vioor_agency_avatar_1791839927170.jpg';
import courseCoverPt from '../assets/images/course_cover_pt_vioor_1791839948618.jpg';
import courseCoverEs from '../assets/images/course_cover_es_vioor_1791839957337.jpg';
import courseCoverRoteiros from '../assets/images/course_cover_roteiros_1791834663885.jpg';
import courseCoverEdicaoViral from '../assets/images/course_cover_edicao_viral_1791836836980.jpg';

export const defaultPageData: PageData = {
  faviconUrl: '/favicon.svg',
  profile: {
    avatarUrl: avatarImg,
    name: 'VIOOR',
    bioHeading: 'Crie seu futuro com a internet:',
    bioBody: 'Transforme habilidades digitais em liberdade, relevância, influência e autoridade para sua marca.',
    stat1: '+1.2M Visualizações',
    stat2: 'Agência Digital',
    avatarZoom: 100,
    avatarPosX: 50,
    avatarPosY: 50,
  },
  card1: {
    id: 'card1',
    badge: 'Método para Viralização',
    badgeColor: '#ff4612',
    line1: 'Entre para a lista de favoritos do',
    line2Prefix: 'Instagram e cresça de ',
    line2Bold: '5.000 a',
    line3Bold: '30.000 seguidores por mês',
    line3Suffix: '.',
    buttonText: 'Saber Mais...',
    coverImage: courseCoverPt,
    
    // Modal
    modalTag: 'MÉTODO EXCLUSIVO',
    modalTitle: 'Método para Viralização',
    modalSubtitle: 'Formato Criativo de Conteúdo com a VIOOR',
    modalStats: '⭐ 4.9 (1.840 avaliações) · +18.000 alunos',
    learningTitle: 'O que você vai aprender:',
    learningItems: [
      {
        title: 'Posicionamento & Formato Magnético:',
        description: 'Como se destacar instantaneamente no feed.',
      },
      {
        title: 'Roteirização que Prende a Atenção:',
        description: 'Estruturas de 3 a 60 segundos com retenção acima de 85%.',
      },
      {
        title: 'Crescimento de 5.000 a 30.000 seguidores/mês:',
        description: 'Sem depender de sorte ou anúncios caros.',
      },
      {
        title: 'Monetização Express:',
        description: 'Transforme visualizações em parcerias e vendas todos os dias.',
      },
    ],
    perk1Title: '45+ Aulas Práticas',
    perk1Desc: 'Passo a passo do zero ao avançado',
    perk2Title: '7 Dias de Garantia',
    perk2Desc: 'Risco zero incondicional',
    offerBadge: 'Oferta Especial de Lançamento',
    originalPrice: 'R$ 997,00',
    installmentPrice: '12x R$ 49,60',
    cashPrice: 'ou R$ 497 à vista no PIX',
    checkoutButtonText: 'Garantir Minha Vaga Agora',
    checkoutUrl: 'https://checkout.perfectpay.com.br/',
  },
  card2: {
    id: 'card2',
    badge: 'Método viral - Español',
    badgeColor: '#235848',
    line1: 'Entra en la lista de favoritos de',
    line2Prefix: 'Instagram y gana entre ',
    line2Bold: '5.000 y',
    line3Bold: '30.000 seguidores al mes',
    line3Suffix: '.',
    buttonText: 'Descubra más',
    coverImage: courseCoverEs,
    
    // Modal
    modalTag: 'MÉTODO EXCLUSIVO · ESPAÑOL',
    modalTitle: 'Método Viral en Español',
    modalSubtitle: 'Formato Creativo de Contenido por VIOOR Agency',
    modalStats: '⭐ 4.9 (Valoración de alumnos) · Comunidad Hispana',
    learningTitle: 'Lo que aprenderás:',
    learningItems: [
      {
        title: 'Algoritmo de Instagram Desbloqueado:',
        description: 'Entiende qué hace viral a los Reels hoy en día.',
      },
      {
        title: 'Estrategia de 5.000 a 30.000 seguidores al mes:',
        description: 'Crecimiento orgánico sostenido.',
      },
      {
        title: 'Plantillas y Guiones Listos:',
        description: 'Ahorra horas de trabajo con fórmulas probadas.',
      },
      {
        title: 'Monetización de Audiencia:',
        description: 'Vende productos y servicios a tus seguidores.',
      },
    ],
    perk1Title: 'Clases Prácticas',
    perk1Desc: 'Acceso inmediato y de por vida',
    perk2Title: 'Garantía Total',
    perk2Desc: '7 días de satisfacción asegurada',
    offerBadge: 'Inscripción Internacional',
    originalPrice: '$197 USD',
    installmentPrice: '$97 USD',
    cashPrice: 'Acceso inmediato y vitalicio a todas las clases',
    checkoutButtonText: 'Inscribirme al Método Viral',
    checkoutUrl: 'https://hotmart.com/',
  },
  card3: {
    id: 'card3',
    badge: 'Roteiros Magnéticos',
    badgeColor: '#7c3aed',
    line1: 'Copie e cole estruturas validadas de',
    line2Prefix: 'vídeos que geram de ',
    line2Bold: '100k a',
    line3Bold: '1 milhão de visualizações',
    line3Suffix: '.',
    buttonText: 'Acessar Pack',
    coverImage: courseCoverRoteiros,
    
    // Modal
    modalTag: 'PACK PRÁTICO · COPIE E COLE',
    modalTitle: 'Roteiros Magnéticos',
    modalSubtitle: 'Estruturas validadas para Reels, TikTok e Shorts',
    modalStats: '⚡ 70+ Modelos Prontos · Acesso Imediato',
    learningTitle: 'O que está incluído no Pack:',
    learningItems: [
      {
        title: '50+ Ganchos de Primeiros 3 Segundos:',
        description: 'Destrua a taxa de rejeição e retenha a atenção.',
      },
      {
        title: 'Estruturas Narrativas de 30 a 90s:',
        description: 'Roteiros com início, meio, clímax e CTA irresistível.',
      },
      {
        title: 'Templates no Notion & PDF:',
        description: 'Organize suas gravações de forma rápida e produtiva.',
      },
      {
        title: 'Bônus Especial:',
        description: 'Como adaptar qualquer roteiro para o seu nicho específico.',
      },
    ],
    perk1Title: 'Modelos Prontos',
    perk1Desc: 'Copie e adapte em poucos minutos',
    perk2Title: 'Atualizações',
    perk2Desc: 'Novos roteiros adicionados todo mês',
    offerBadge: 'Oferta Especial de Acesso Imediato',
    originalPrice: 'R$ 197,00',
    installmentPrice: 'R$ 47,00',
    cashPrice: 'Pagamento único · Acesso vitalício',
    checkoutButtonText: 'Baixar Pack de Roteiros Agora',
    checkoutUrl: 'https://checkout.perfectpay.com.br/',
  },
  card4: {
    id: 'card4',
    badge: 'Edição Viral no Celular',
    badgeColor: '#0284c7',
    line1: 'Domine cortes dinâmicos e efeitos que',
    line2Prefix: 'fazem seus vídeos ',
    line2Bold: 'prenderem a atenção',
    line3Bold: 'do início ao fim',
    line3Suffix: '.',
    buttonText: 'Aprender Edição',
    coverImage: courseCoverEdicaoViral,
    
    // Modal
    modalTag: 'MASTERCLASS PRÁTICA',
    modalTitle: 'Edição Viral no Celular',
    modalSubtitle: 'Domine o CapCut e crie vídeos profissionais em minutos',
    modalStats: '⭐ 4.9 (920 avaliações) · +8.500 alunos',
    learningTitle: 'O que você vai dominar na prática:',
    learningItems: [
      {
        title: 'Ritmo & Dinâmica de Corte:',
        description: 'Como eliminar pausas e manter o espectador hipnotizado.',
      },
      {
        title: 'Sound Design & Efeitos Sonoros:',
        description: 'O segredo dos vídeos que bombam no algoritmo.',
      },
      {
        title: 'Legendas Animadas e Ícones:',
        description: 'Crie legendas idênticas às dos maiores criadores do mundo.',
      },
      {
        title: 'Pack com 200+ Efeitos e Músicas:',
        description: 'Biblioteca exclusiva pronta para usar no seu celular.',
      },
    ],
    perk1Title: '100% no Celular',
    perk1Desc: 'Edite sem precisar de computador',
    perk2Title: 'Pack de Sons & Efeitos',
    perk2Desc: 'Download direto no smartphone',
    offerBadge: 'Condição Especial',
    originalPrice: 'R$ 297,00',
    installmentPrice: '12x R$ 9,70',
    cashPrice: 'ou R$ 97 à vista',
    checkoutButtonText: 'Começar Agora',
    checkoutUrl: 'https://checkout.perfectpay.com.br/',
  },
  support: {
    whatsappNumber: '5511999999999',
    modalTitle: 'Central de Suporte ao Aluno',
    modalSubtitle: 'Nossa equipe está pronta para te atender de segunda a sexta, das 09h às 18h.',
    reasons: [
      {
        id: 'acesso',
        title: 'Problema de Acesso / Login',
        desc: 'Não recebi o e-mail da Hotmart / Kiwify',
        message: 'Olá equipe da VIOOR! Comprei o curso e preciso de ajuda com meu acesso.',
      },
      {
        id: 'duvida',
        title: 'Dúvidas sobre o Curso',
        desc: 'Perguntas sobre as aulas ou materiais',
        message: 'Olá equipe da VIOOR! Sou aluno(a) e tenho uma dúvida sobre as aulas do curso.',
      },
      {
        id: 'comunidade',
        title: 'Comunidade de Alunos',
        desc: 'Entrar no grupo VIP de networking',
        message: 'Olá! Sou aluno(a) e gostaria de ter acesso à comunidade exclusiva de criadores.',
      },
      {
        id: 'outro',
        title: 'Outro Atendimento',
        desc: 'Falar diretamente com um atendente humano',
        message: 'Olá equipe de suporte da VIOOR! Preciso de ajuda com meu cadastro.',
      },
    ],
  },
  socials: {
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
    tiktok: 'https://tiktok.com/',
    facebook: 'https://facebook.com/',
  },
};
