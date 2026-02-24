# Análise de UI/UX Mobile - Acompanha MD

🤖 **Applying knowledge of `@mobile-developer` and `@frontend-specialist`...**

Dado que 90% dos usuários acesso o Acompanha MD via celular (portal do paciente e, possivelmente, médicos em trânsito), a experiência mobile não deve ser apenas uma "versão adaptada do desktop". Ela deve ser **Touch-First, Rápida e com Feedback Imediato**.

Aqui está a análise profunda e as novas ideias para implementar no front-end, seguindo os princípios Anti-Clichê e as restrições da nossa arquitetura (Tailwind + shadcn no Next.js).

---

## 🛑 Problemas Comuns (Checklist de Correção Imediata)

Antes de criar coisas novas, devemos garantir que não estamos cometendo "Pecados Mobile":

1. **Touch Targets Minúsculos:** Qualquer botão, link ou área clicável (sobretudo os de check-in) deve ter no **mínimo 44x44px** (ideal 48x48px). Dedos não são mouses.
2. **"Thumb Zone" Ignorada:** Ações principais (Salvar Check-in, Gerar PDF) estão fáceis de alcançar com o polegar (metade inferior da tela)? Se estiverem no topo esquerdo, estão no pior lugar possível.
3. **Falta de Feedback (Ghost Taps):** Quando o usuário toca para enviar um formulário ou salvar notas, há um estado de `loading` instantâneo em botões? No mobile, a latência de rede é variável (3G/4G). A UI deve responder no ato.
4. **Forms Extensos sem Paginação:** O Check-in semanal (11 itens) se for exibido em uma única tela longa com scroll infinito causa fadiga cognitiva.
5. **Gráficos Não Otimizados:** O `Recharts` por padrão pode não lidar bem com redimensionamentos abruptos ou toques (tooltips minúsculos). Os gráficos no celular precisam ter tooltips fixos ou acionados de forma mais clara.

---

## ✨ Novas Ideias de Implementação (UX Premium & Anti-Clichê)

### 1. Check-in Semanal Estilo "Stories" (O Fim do Formulário Chato)
* **O Problema:** Preencher 11 campos de 1 a 10 rolando a tela para baixo parece imposto de renda, não saúde.
* **A Solução:** Transformar o Check-in em uma experiência de etapa única (1 pergunta por tela) com barra de progresso no topo. 
* **Design/UI:** Em vez de *sliders* genéricos ou `<input type="number">`, usar botões de impacto visual grandes. Se a nota for 1-3 (vermelho/alerta), a cor de fundo da tela pode fazer uma transição suave. Isso prende a atenção e melhora a qualidade da resposta.

### 2. Dashboard Pessoal Brutalista/Minimalista (Patient Portal)
* **O Problema:** Dashboards de saúde costumam ser um amontoado de cards "Bento Grid" (o clichê atual).
* **A Solução (Layout Asimétrico):** Dar foco absoluto à métrica mais importante da semana contrapondo com um espaço vazio.
* **Exemplo:** Tipografia gigantesca para o "Status Atual" (ex: **SEGURO**) no centro da tela. Sem grids perfeitos. Gráficos de evolução de peso não precisam estar em "cards" brancos com sombreados, podem se misturar com a cor de fundo (removendo bordas) focando na fluidez da linha.

### 3. Bottom Navigation (Tab Bar) em vez de Sidebar (Hamburguer Menu)
* **O Problema:** Esconder a navegação principal (Dashboard, Check-in, Perfil, Evolução) atrás de um menu hambúrguer exige dois toques e esconde o contexto no mobile.
* **A Solução:** Implementar uma barra de navegação inferior permanente (*Bottom Tab Bar*) flutuante, inspirada no design iOS.
* **UI Premium:** Fundo translúcido (`backdrop-blur`) APENAS nesta barra inferior (para dar o efeito "vidro" apenas onde é funcional), com ícones (Lucide) que ganham preenchimento (*fill*) ao serem selecionados, usando uma animação *spring* (com framer-motion ou classes de tw-animate-css).

### 4. Gestos e Animações Funcionais (Micro-interações)
O celular é uma interface física. Tudo que se toca deve reagir.
* **Swipe-to-Action na Lista de Médicos:** Ao invés de o médico ter que abrir o prontuário para adicionar uma nota rápida ou ver um alerta, ele deve poder "puxar" o card do paciente para a direita para ações rápidas.
* **O "Skeleton" Essencial:** Transições de rotas no Next.js (App Router) pelo celular podem demorar 200-500ms em redes ruins. Usar `loading.tsx` com *Skeletons* abstratos (sem simular texto exato, apenas formas geométricas) para manter a ilusão de velocidade.

### 5. Comparador de Fotos Aprimorado (Medições)
* **O Problema:** Comparar o "Antes e Depois" no mobile requer que as fotos fiquem impossivelmente pequenas ou que o usuário role a tela para cima e para baixo.
* **A Solução:** Um slider de sobreposição tipo "cortina". A foto antiga fica por trás, a nova na frente, e o usuário arrasta uma linha vertical para a esquerda/direita com o dedo para ver a transformação. Isso é interativo, gratificante e 100% projetado para o toque.

### 6. Geometria Agressiva e Paleta "Sem Medo"
(Aplicando regras do Frontend Specialist - Purple Ban / Anti-safe harbor)
* **Status Crítico não precisa ser rosa-pastel:** Se algo está crítico, use um **Vermelho Puro/Sangue** com bordas secas (0px radius). Se está seguro, um verde elétrico. Fugir do azul-claro corporativo ou do alerta suave. Saúde de alta performance exige visuais de impacto.

---

## 📝 Plano de Ação Imediato Sustentável

Se fossemos atacar isso em sprints, a ordem de maior impacto X menor esforço seria:

1. **Sprint 1 (Fundamentos):** Revisar tamanhos de botões (min 44px), transformar a navegação principal mobile em uma *Bottom Tab Bar* isolada.
2. **Sprint 2 (Core Feature):** Refatorar a visualização da tela de Check-in para funcionar como um "Wizard" passo-a-passo e não um listão vertical.
3. **Sprint 3 (Premium Feel):** Adicionar o componente *Slider* interativo para as medições e melhorar o comportamento dos gráficos Redux no mobile (evitando scroll de página acidental quando o dedo toca no gráfico).

O que você acha dessas frentes? Gostaria que detalhássemos e planejássemos a implementação do **Check-in estilo Stories** ou a **Bottom Navigation (Tab Bar)** primeiro?
