export const SAMPLE_NOVA_AI_HTML = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova AI - O Futuro do Desenvolvimento Autônomo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#f0f3ff',
              100: '#e1e7fe',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
              900: '#312e81',
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-brand-500 selection:text-white min-h-screen flex flex-col">

  <!-- Header / Navbar -->
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <i class="fa-solid fa-sparkles text-white text-lg"></i>
        </div>
        <span class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">Nova.ai</span>
      </div>

      <nav class="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
        <a href="#features" class="hover:text-indigo-400 transition-colors">Recursos</a>
        <a href="#demo" class="hover:text-indigo-400 transition-colors">Demonstração</a>
        <a href="#pricing" class="hover:text-indigo-400 transition-colors">Planos</a>
        <a href="#faq" class="hover:text-indigo-400 transition-colors">FAQ</a>
      </nav>

      <div class="flex items-center space-x-4">
        <button onclick="toggleDarkMode()" class="p-2.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all">
          <i id="theme-icon" class="fa-solid fa-sun"></i>
        </button>
        <button onclick="openModal()" class="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5">
          Começar Grátis
          <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- Toast Notification Container -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 hidden bg-slate-900 border border-indigo-500/50 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300">
    <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
    <span id="toast-message" class="text-sm font-medium">Ação realizada com sucesso!</span>
  </div>

  <!-- Hero Section -->
  <section class="relative pt-24 pb-20 overflow-hidden">
    <!-- Glowing background elements -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 to-pink-500/20 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
      <div class="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md">
        <span class="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
        <span>Lançamento do Nova 3.0 • Agentes Autônomos em Tempo Real</span>
      </div>

      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
        Crie aplicações completas na velocidade da sua <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">imaginação</span>
      </h1>

      <p class="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
        A primeira inteligência artificial que transforma prompts e URLs em sites, aplicativos e APIs de alto desempenho em segundos.
      </p>

      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onclick="showToast('Iniciando ambiente de teste do Nova AI...')" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5">
          Testar Grátis Agora
        </button>
        <button onclick="document.getElementById('demo').scrollIntoView({behavior: 'smooth'})" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition-all">
          <i class="fa-solid fa-play text-indigo-400 mr-2"></i> Ver Demonstração
        </button>
      </div>

      <!-- Preview Canvas Graphic -->
      <div id="demo" class="mt-16 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto text-left overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 px-3">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-rose-500"></div>
            <div class="w-3 h-3 rounded-full bg-amber-500"></div>
            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <span class="text-xs font-mono text-slate-500">nova-editor-preview.app</span>
          <span class="text-xs font-medium text-emerald-400"><i class="fa-solid fa-circle text-[8px] mr-1"></i> Live Session</span>
        </div>
        <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300">
            <div class="text-indigo-400 mb-2">// Prompt do Usuário:</div>
            <div class="text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800">
              "Crie um aplicativo de finanças pessoais com modo escuro, gráfico de receitas e resumo mensal."
            </div>
            <div class="mt-4 text-emerald-400 flex items-center">
              <i class="fa-solid fa-check text-xs mr-2"></i> Compilado com sucesso (120ms)
            </div>
          </div>
          <div class="lg:col-span-2 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-semibold text-white">Finances Overview</span>
              <span class="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">+18.4% este mês</span>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span class="text-xs text-slate-400">Saldo Total</span>
                <div class="text-lg font-bold text-white mt-1">R$ 24.850,00</div>
              </div>
              <div class="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span class="text-xs text-slate-400">Gasto Mensal</span>
                <div class="text-lg font-bold text-rose-400 mt-1">R$ 3.210,00</div>
              </div>
            </div>
            <div class="h-24 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-lg border border-indigo-500/30 flex items-end p-2 justify-between">
              <div class="w-8 bg-indigo-500 h-12 rounded-t"></div>
              <div class="w-8 bg-indigo-500 h-16 rounded-t"></div>
              <div class="w-8 bg-indigo-500 h-10 rounded-t"></div>
              <div class="w-8 bg-indigo-500 h-20 rounded-t"></div>
              <div class="w-8 bg-purple-500 h-24 rounded-t"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="py-20 border-t border-slate-800/60 bg-slate-950/50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Recursos que revolucionam a criação web</h2>
        <p class="mt-4 text-slate-400 text-base">Tudo o que você precisa para sair do zero até um código limpo e pronto para produção.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-code"></i>
          </div>
          <h3 class="mt-6 text-xl font-bold text-white">Geração de Código Limpo</h3>
          <p class="mt-3 text-slate-400 text-sm leading-relaxed">Gera HTML5, Tailwind CSS e JavaScript limpos, sem bibliotecas pesadas desnecessárias e fáceis de customizar.</p>
        </div>

        <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10 group">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h3 class="mt-6 text-xl font-bold text-white">Refinamento em Tempo Real</h3>
          <p class="mt-3 text-slate-400 text-sm leading-relaxed">Digite o que deseja mudar ("Mude as cores para verde", "Adicione um gráfico") e veja o site se transformar instantaneamente.</p>
        </div>

        <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/50 transition-all hover:shadow-xl hover:shadow-pink-500/10 group">
          <div class="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-xl group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-laptop-mobile"></i>
          </div>
          <h3 class="mt-6 text-xl font-bold text-white">Totalmente Responsivo</h3>
          <p class="mt-3 text-slate-400 text-sm leading-relaxed">Cada componente é testado e otimizado para celulares, tablets e telas de alta resolução sem esforço adicional.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="py-20 border-t border-slate-800/60">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Planos simples e transparentes</h2>
        <p class="mt-4 text-slate-400 text-base">Escolha o plano ideal para acelerar seu desenvolvimento.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Plan 1 -->
        <div class="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <span class="text-sm font-semibold text-slate-400">Starter</span>
            <div class="mt-4 flex items-baseline text-white">
              <span class="text-4xl font-extrabold">R$ 0</span>
              <span class="ml-1 text-slate-400 text-sm">/mês</span>
            </div>
            <ul class="mt-8 space-y-4 text-sm text-slate-300">
              <li class="flex items-center"><i class="fa-solid fa-check text-indigo-400 mr-3"></i> Até 10 gerações/mês</li>
              <li class="flex items-center"><i class="fa-solid fa-check text-indigo-400 mr-3"></i> Exportação em HTML5</li>
              <li class="flex items-center"><i class="fa-solid fa-check text-indigo-400 mr-3"></i> Suporte à comunidade</li>
            </ul>
          </div>
          <button onclick="showToast('Plano Starter ativado!')" class="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Começar Grátis</button>
        </div>

        <!-- Plan 2 (Featured) -->
        <div class="p-8 rounded-2xl bg-slate-900 border-2 border-indigo-500 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/20">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Mais Popular</div>
          <div>
            <span class="text-sm font-semibold text-indigo-400">Pro Developer</span>
            <div class="mt-4 flex items-baseline text-white">
              <span class="text-4xl font-extrabold">R$ 89</span>
              <span class="ml-1 text-slate-400 text-sm">/mês</span>
            </div>
            <ul class="mt-8 space-y-4 text-sm text-slate-300">
              <li class="flex items-center"><i class="fa-solid fa-check text-emerald-400 mr-3"></i> Gerações ilimitadas</li>
              <li class="flex items-center"><i class="fa-solid fa-check text-emerald-400 mr-3"></i> Refinamento com IA em tempo real</li>
              <li class="flex items-center"><i class="fa-solid fa-check text-emerald-400 mr-3"></i> Exportação em ZIP e React</li>
              <li class="flex items-center"><i class="fa-solid fa-check text-emerald-400 mr-3"></i> Suporte prioritário 24/7</li>
            </ul>
          </div>
          <button onclick="showToast('Assinatura Pro iniciada com sucesso!')" class="mt-8 w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30">Assinar Plano Pro</button>
        </div>

        <!-- Plan 3 -->
        <div class="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <span class="text-sm font-semibold text-slate-400">Enterprise</span>
            <div class="mt-4 flex items-baseline text-white">
              <span class="text-4xl font-extrabold">Customizado</span>
            </div>
            <ul class="mt-8 space-y-4 text-sm text-slate-300">
              <li class="flex items-center"><i class="fa-solid fa-check text-indigo-400 mr-3"></i> Modelos dedicados de IA</li>
              <li class="flex items-center"><i class="fa-solid fa-check text-indigo-400 mr-3"></i> Integração com GitHub & Figma</li>
              <li class="flex items-center"><i class="fa-solid fa-check text-indigo-400 mr-3"></i> SLA garantido</li>
            </ul>
          </div>
          <button onclick="showToast('Equipe de vendas notificada!')" class="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Falar com Vendas</button>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Accordion -->
  <section id="faq" class="py-20 border-t border-slate-800/60 bg-slate-950/50">
    <div class="max-w-4xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-center text-white mb-12">Perguntas Frequentes</h2>
      <div class="space-y-4">
        <div class="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
          <button onclick="toggleFaq(1)" class="w-full p-5 text-left font-semibold text-white flex justify-between items-center hover:bg-slate-800/50 transition-colors">
            <span>Como funciona a geração de código por IA?</span>
            <i id="faq-icon-1" class="fa-solid fa-chevron-down text-indigo-400 transition-transform"></i>
          </button>
          <div id="faq-ans-1" class="hidden p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-800/40 mt-2">
            A IA analisa seu prompt ou a URL de referência e escreve dinamicamente HTML5 semanticamente correto, com classes responsivas do Tailwind CSS e JavaScript funcional para simular o comportamento real do site.
          </div>
        </div>

        <div class="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
          <button onclick="toggleFaq(2)" class="w-full p-5 text-left font-semibold text-white flex justify-between items-center hover:bg-slate-800/50 transition-colors">
            <span>Posso baixar o código gerado para usar no meu servidor?</span>
            <i id="faq-icon-2" class="fa-solid fa-chevron-down text-indigo-400 transition-transform"></i>
          </button>
          <div id="faq-ans-2" class="hidden p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-800/40 mt-2">
            Sim! O código gerado é 100% autônomo. Você pode copiar o HTML ou fazer o download do arquivo .html diretamente no navegador e hospedá-lo onde desejar (Vercel, Netlify, GitHub Pages, etc.).
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Modal -->
  <div id="modal" class="fixed inset-0 z-50 hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
      <button onclick="closeModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
      <h3 class="text-xl font-bold text-white mb-2">Criar Conta Gratuita</h3>
      <p class="text-sm text-slate-400 mb-6">Experimente o Nova AI e crie seu primeiro site em menos de 1 minuto.</p>
      <form onsubmit="event.preventDefault(); closeModal(); showToast('Conta criada com sucesso!');" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Seu Nome</label>
          <input type="text" required placeholder="Ex: Maria Souza" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Seu E-mail</label>
          <input type="email" required placeholder="seu@email.com" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
        </div>
        <button type="submit" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30">Cadastrar Gratuitamente</button>
      </form>
    </div>
  </div>

  <!-- Footer -->
  <footer class="mt-auto border-t border-slate-800 py-10 bg-slate-950">
    <div class="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
      <p>© 2026 Nova AI Technologies. Todos os direitos reservados. Gerado por AI WebBrowser.</p>
    </div>
  </footer>

  <!-- Scripts -->
  <script>
    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
      const icon = document.getElementById('theme-icon');
      if (document.documentElement.classList.contains('dark')) {
        icon.className = 'fa-solid fa-moon';
      } else {
        icon.className = 'fa-solid fa-sun';
      }
      showToast('Tema alternado!');
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-message');
      toastMsg.innerText = msg;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }

    function openModal() {
      document.getElementById('modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('modal').classList.add('hidden');
    }

    function toggleFaq(id) {
      const ans = document.getElementById('faq-ans-' + id);
      const icon = document.getElementById('faq-icon-' + id);
      if (ans.classList.contains('hidden')) {
        ans.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
      } else {
        ans.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
      }
    }
  </script>
</body>
</html>`;

export const PRESET_LIST = [
  {
    id: "saas-landing",
    title: "Nova AI - Platform SaaS",
    url: "https://nova.ai/platform",
    description: "Landing page futurista para plataforma de Inteligência Artificial com preços, gráficos e depoimentos.",
    prompt: "Plataforma SaaS de Inteligência Artificial chamada Nova AI com dashboard interativo, tabela de preços e depoimentos.",
    category: "saas" as const,
    icon: "sparkles",
  },
  {
    id: "apple-watch",
    title: "Apple - Watch Ultra Studio",
    url: "https://apple.com/watch-ultra",
    description: "Vitrine de produto premium inspirada na Apple com seções imersivas e especificações.",
    prompt: "Site oficial no estilo Apple para o Apple Watch Ultra com design escuro de luxo, animações e especificações técnicas.",
    category: "apple" as const,
    icon: "watch",
  },
  {
    id: "dev-portfolio",
    title: "Lucas Silva - Fullstack Developer",
    url: "https://lucassilva.dev",
    description: "Portfólio moderno de desenvolvedor com filtro de projetos, skills interativas e modo escuro.",
    prompt: "Portfólio de engenheiro de software fullstack com lista de projetos filtrável, contatos, formulário e efeito matriz no fundo.",
    category: "portfolio" as const,
    icon: "code",
  },
  {
    id: "analytics-dashboard",
    title: "MetricPulse - Dashboard Analytics",
    url: "https://metricpulse.io/dashboard",
    description: "Painel de controle financeiro e métricas em tempo real com gráficos e cartões de KPI.",
    prompt: "Dashboard analítico responsivo para métricas SaaS com gráficos interativos Canvas, tabela de clientes e alertas.",
    category: "dashboard" as const,
    icon: "layout-dashboard",
  },
  {
    id: "gourmet-restaurant",
    title: "Bistro L'Étoile - Gastronomia",
    url: "https://bistroletoile.com.br",
    description: "Site para restaurante gourmet com cardápio digital interativo e reservas online.",
    prompt: "Site elegante para restaurante francês gourmet com menu com abas de pratos, galeria de fotos e modal de reservas.",
    category: "business" as const,
    icon: "utensils",
  },
];
