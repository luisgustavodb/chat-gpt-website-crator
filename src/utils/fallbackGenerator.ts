export function generateFallbackSite(query: string, formattedUrl: string): string {
  const title = query.length > 30 ? query.substring(0, 30) + '...' : query;
  const capitalizedTitle = query.charAt(0).toUpperCase() + query.slice(1);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">

  <!-- Header / Navbar -->
  <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold text-lg">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <div>
          <span class="font-extrabold text-xl tracking-tight text-white">${title}</span>
          <span class="block text-[10px] text-blue-400 font-mono">${formattedUrl}</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#recursos" class="hover:text-blue-400 transition-colors">Recursos</a>
        <a href="#sobre" class="hover:text-blue-400 transition-colors">Sobre</a>
        <a href="#depoimentos" class="hover:text-blue-400 transition-colors">Depoimentos</a>
        <a href="#precos" class="hover:text-blue-400 transition-colors">Planos</a>
      </nav>

      <div class="flex items-center gap-3">
        <button onclick="alert('Bem-vindo a ' + '${title}')" class="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
          Entrar
        </button>
        <button onclick="document.getElementById('modal-demo').classList.remove('hidden')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]">
          Começar Agora
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative py-20 px-6 overflow-hidden flex-1 flex items-center justify-center">
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-4xl mx-auto text-center relative z-10 space-y-6">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
        <i class="fa-solid fa-sparkles text-xs"></i>
        <span>Plataforma Inteligente Gerada para "${capitalizedTitle}"</span>
      </div>

      <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
        A Nova Era de <span class="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">${capitalizedTitle}</span>
      </h1>

      <p class="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Sua solução definitiva projetada com tecnologias modernas, alta performance e design responsivo. Crie, gerencie e evolua seus projetos com inteligência.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button onclick="document.getElementById('modal-demo').classList.remove('hidden')" class="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all hover:scale-105 flex items-center gap-2">
          <span>Explorar Plataforma</span>
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </button>
        <button onclick="alert('Vídeo demonstrativo em breve!')" class="px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2">
          <i class="fa-solid fa-circle-play text-blue-400"></i>
          <span>Assistir Demonstração</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Feature Grid -->
  <section id="recursos" class="py-16 px-6 bg-slate-950/60 border-t border-slate-800">
    <div class="max-w-7xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-2xl md:text-3xl font-extrabold text-white">Recursos Incomparáveis</h2>
        <p class="text-slate-400 text-sm mt-2">Tudo o que você precisa para alcançar o próximo nível em ${capitalizedTitle}.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-gauge-high"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Alta Performance</h3>
          <p class="text-slate-400 text-xs leading-relaxed">Carregamento ultrarrápido com código otimizado e arquitetura moderna.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Segurança Avançada</h3>
          <p class="text-slate-400 text-xs leading-relaxed">Proteção contínua contra vulnerabilidades com criptografia ponta a ponta.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-brain"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Inteligência Artificial</h3>
          <p class="text-slate-400 text-xs leading-relaxed">Automações inteligentes e insights preditivos integrados nativamente.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Modal -->
  <div id="modal-demo" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
      <button onclick="document.getElementById('modal-demo').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
      <div class="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl">
        <i class="fa-solid fa-rocket"></i>
      </div>
      <h3 class="text-xl font-bold text-white">Criar Conta em ${title}</h3>
      <p class="text-xs text-slate-400">Insira seu e-mail para receber acesso antecipado à plataforma.</p>
      <input type="email" placeholder="seu.email@exemplo.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
      <button onclick="alert('Obrigado! Cadastro realizado com sucesso.'); document.getElementById('modal-demo').classList.add('hidden');" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all">
        Confirmar Cadastro
      </button>
    </div>
  </div>

  <!-- Footer -->
  <footer class="py-8 px-6 bg-slate-950 border-t border-slate-800 text-center text-slate-500 text-xs">
    <p>© ${new Date().getFullYear()} ${title}. Todos os direitos reservados. Gerado com Inteligência Artificial.</p>
  </footer>

</body>
</html>`;
}
