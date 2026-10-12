/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PageData } from '../types/pageData';
import avatarImg from '../assets/images/hanah_franklin_avatar_1791833644657.jpg';
import courseCoverPt from '../assets/images/course_cover_portuguese_1791833654392.jpg';
import courseCoverEs from '../assets/images/course_cover_spanish_1791833665248.jpg';
import courseCoverRoteiros from '../assets/images/course_cover_roteiros_1791834663885.jpg';

export const defaultPageData: PageData = {
  profile: {
    avatarUrl: avatarImg,
    name: 'Hanah Franklin',
    bioHeading: 'Crie seu futuro com a internet:',
    bioBody: 'Transforme habilidades digitais em liberdade, relevância, influência e dinheiro.',
    stat1: '+1.2M Criadores',
    stat2: 'Método Viral',
  },
  card1: {
    id: 'pt',
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
    modalSubtitle: 'Formato Criativo de Conteúdo com Hanah Franklin',
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
    id: 'es',
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
    modalSubtitle: 'Formato Creativo de Contenido por Hanah Franklin',
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
    id: 'roteiros',
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
  support: {
    title: 'Suporte aos Alunos',
    subtitle: 'Clique aqui se já é aluno e precisa de ajuda.',
    linkText: 'Abrir atendimento WhatsApp',
    whatsappNumber: '5511999999999',
    modalTitle: 'Central de Suporte ao Aluno',
    modalSubtitle: 'Nossa equipe está pronta para te atender de segunda a sexta, das 09h às 18h.',
    reasons: [
      {
        id: 'acesso',
        title: 'Problema de Acesso / Login',
        desc: 'Não recebi o e-mail da Hotmart / Kiwify',
        message: 'Olá equipe da Hanah! Comprei o Método para Viralização e preciso de ajuda com meu acesso.',
      },
      {
        id: 'duvida',
        title: 'Dúvidas sobre o Curso',
        desc: 'Perguntas sobre as aulas ou materiais',
        message: 'Olá equipe da Hanah! Sou aluno(a) e tenho uma dúvida sobre as aulas do curso.',
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
        message: 'Olá equipe de suporte da Hanah Franklin! Preciso de ajuda com meu cadastro.',
      },
    ],
  },
  socials: {
    instagram: {
      username: '@hanahfranklin',
      followers: '348.000',
      followersLabel: 'Seguidores no Instagram',
      description: 'Dicas diárias de conteúdo criativo nos Stories e Reels virais toda semana.',
      buttonText: 'Seguir no Instagram',
      url: 'https://instagram.com/',
    },
    youtube: {
      username: 'Hanah Franklin',
      followers: '128.000',
      followersLabel: 'Inscritos no YouTube',
      description: 'Aulas completas e aprofundadas sobre criação de conteúdo e monetização.',
      buttonText: 'Inscrever-se no Canal',
      url: 'https://youtube.com/',
    },
    tiktok: {
      username: '@hanahfranklin.oficial',
      followers: '512.000',
      followersLabel: 'Seguidores no TikTok',
      description: 'Vídeos rápidos de hacks de edição, roteiros e tendências da semana.',
      buttonText: 'Acompanhar no TikTok',
      url: 'https://tiktok.com/',
    },
  },
};
