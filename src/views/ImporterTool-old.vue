<template>
  <div class="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
    <div class="grid grid-cols-12 gap-6 h-full">

      <div class="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-lg h-full">
        <div ref="g6Container" class="g6-container"></div>
      </div>

      <div class="col-span-12 lg:col-span-4 h-full overflow-y-auto">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h2 class="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <Wand2Icon class="h-6 w-6 text-blue-600" />
              赋能
            </h2>
            <p class="text-gray-600 mt-2">在选中节点下，快速生成子任务或想法</p>
          </div>
          <div class="p-6 space-y-4">
            <textarea
              v-model="prompt"
              placeholder="例如：市场调研"
              rows="6"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
            <button
              @click="generateAndAppendChildren"
              :disabled="isGenerating || !prompt.trim()"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Loader2Icon v-if="isGenerating" class="h-5 w-5 animate-spin" />
              <Wand2Icon v-else class="h-5 w-5" />
              {{ isGenerating ? '生成中...' : '追加节点' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="toast.show" class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4" :class="{ 'border-green-200 bg-green-50': toast.type === 'success', 'border-red-200 bg-red-50': toast.type === 'error' }">
        <div class="flex items-start gap-3">
          <CheckCircleIcon v-if="toast.type === 'success'" class="h-5 w-5 text-green-600 mt-0.5" />
          <XCircleIcon v-if="toast.type === 'error'" class="h-5 w-5 text-red-600 mt-0.5" />
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">{{ toast.title }}</h4>
            <p class="text-sm text-gray-600 mt-1">{{ toast.description }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import G6 from '@antv/g6';
import { Wand2, Loader2, CheckCircle, XCircle, X } from 'lucide-vue-next';

// --- State Management ---
const Wand2Icon = Wand2, Loader2Icon = Loader2, CheckCircleIcon = CheckCircle, XCircleIcon = XCircle, XIcon = X;
const prompt = ref('');
const isGenerating = ref(false);
const toast = ref({ show: false, type: 'success', title: '', description: '' });
const g6Container = ref(null);
let graph = null;
let isDragging = false;

// --- G6 Customization ---
const breakTextIntoLines = (text, maxWidth, fontSize) => {
  if (!text) return { lines: [''], width: 0, height: 0 };
  const lines = [];
  let currentLine = '';
  let maxLineWidth = 0;
  const formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < formattedText.length; i++) {
    const char = formattedText[i];
    if (char === '\n') {
      lines.push(currentLine);
      maxLineWidth = Math.max(maxLineWidth, G6.Util.getTextSize(currentLine, fontSize)[0]);
      currentLine = '';
      continue;
    }
    const nextLine = currentLine + char;
    const { width } = G6.Util.getTextSize(nextLine, fontSize);
    if (width > maxWidth) {
      lines.push(currentLine);
      maxLineWidth = Math.max(maxLineWidth, G6.Util.getTextSize(currentLine, fontSize)[0]);
      currentLine = char;
    } else {
      currentLine = nextLine;
    }
  }
  lines.push(currentLine);
  maxLineWidth = Math.max(maxLineWidth, G6.Util.getTextSize(currentLine, fontSize)[0]);
  return { lines, width: maxLineWidth, height: lines.length * (fontSize + 4) };
};

G6.registerNode('flow-node', {
  draw(cfg, group) {
    const { label, tag, tagColor, collapsed } = cfg;
    const mainTextFontSize = 14; const tagTextFontSize = 12; const padding = 12; const tagWidth = 55;
    const minWidth = 180;
    const { lines, width: textWidth, height: textBlockHeight } = breakTextIntoLines(label, 120, mainTextFontSize);
    let nodeWidth = padding + tagWidth + padding + textWidth + padding;
    nodeWidth = Math.max(nodeWidth, minWidth);
    const nodeHeight = Math.max(50, textBlockHeight + padding * 2);
    const tagHeight = 22;
    const keyShape = group.addShape('rect', { attrs: { x: 0, y: 0, width: nodeWidth, height: nodeHeight, radius: 8, fill: '#fff', stroke: '#E2E8F0', lineWidth: 1, shadowColor: 'rgba(0,0,0,0.08)', shadowBlur: 10, shadowOffsetX: 2, shadowOffsetY: 2 }, name: 'key-shape' });
    group.addShape('rect', { attrs: { x: padding, y: (nodeHeight - tagHeight) / 2, width: tagWidth, height: tagHeight, radius: 4, fill: tagColor.fill, stroke: tagColor.stroke }, name: 'tag-rect-shape' });
    group.addShape('text', { attrs: { x: padding + tagWidth / 2, y: nodeHeight / 2, textAlign: 'center', textBaseline: 'middle', text: tag, fill: '#fff', fontSize: tagTextFontSize, fontWeight: 'bold' }, name: 'tag-text-shape' });
    const textY = (nodeHeight - textBlockHeight) / 2;
    lines.forEach((line, index) => {
      group.addShape('text', { attrs: { x: padding + tagWidth + padding, y: textY + index * (mainTextFontSize + 4) + (mainTextFontSize / 2), textAlign: 'left', textBaseline: 'middle', text: line, fill: '#4A5568', fontSize: mainTextFontSize }, name: `main-text-shape-${index}` });
    });
    if (cfg.children && cfg.children.length > 0) {
      const buttonX = nodeWidth; const buttonY = nodeHeight / 2;
      group.addShape('circle', { attrs: { x: buttonX, y: buttonY, r: 9, fill: '#fff', stroke: '#A0AEC0', lineWidth: 1, cursor: 'pointer' }, name: 'collapse-expand-button' });
      group.addShape('text', { attrs: { x: buttonX, y: buttonY, textAlign: 'center', textBaseline: 'middle', text: collapsed ? '+' : '-', fill: '#4A5568', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }, name: 'collapse-expand-icon' });
    }
    return keyShape;
  },
  getAnchorPoints() { return [[0, 0.5], [1, 0.5]]; },
  setState(name, value, item) {
    const group = item.getContainer(); const keyShape = group.find(shape => shape.get('name') === 'key-shape');
    if (name === 'selected') { keyShape.attr(value ? { stroke: '#4299E1', lineWidth: 2, shadowColor: '#4299E1', shadowBlur: 15 } : { stroke: '#E2E8F0', lineWidth: 1, shadowColor: 'rgba(0,0,0,0.08)', shadowBlur: 10 }); }
    if (name === 'collapsed') { const icon = group.find(shape => shape.get('name') === 'collapse-expand-icon'); if (icon) icon.attr('text', value ? '+' : '-'); }
  },
});

const colorizeNodeData = (data) => {
  const processNode = (node) => {
    if (!node.tag) return;
    switch(node.tag) {
      case '需求': node.tagColor = { fill: '#DC2626', stroke: '#991B1B' }; break;
      case '功能点': node.tagColor = { fill: '#4299E1', stroke: '#2B6CB0' }; break;
      case '测试点': node.tagColor = { fill: '#9F7AEA', stroke: '#6B46C1' }; break;
      case '测试用例': node.tagColor = { fill: '#ED8936', stroke: '#C05621' }; break;
      default: node.tagColor = { fill: '#A0AEC0', stroke: '#718096' };
    }
  }
  if (data.children) { G6.Util.traverseTree(data, processNode); } 
  else { processNode(data); }
};

// --- Core Logic & Lifecycle ---

onMounted(() => {
  const initialData = {
    id: 'req-root',
    label: '电商交易系统重构',
    tag: '需求',
    children: [{ 
      id: 'func-1', 
      label: '用户登录与注册模块',
      tag: '功能点',
      children: [
        { id: 'test-1-1', label: '登录接口测试', tag: '测试点', children: [
          { id: 'case-1-1-1', label: '正确用户名密码', tag: '测试用例' },
          { id: 'case-1-1-2', label: '错误密码', tag: '测试用例' },
        ]},
        { id: 'test-1-2', label: '注册流程测试', tag: '测试点' },
      ]
    }, {
      id: 'func-2',
      label: '订单处理流程',
      tag: '功能点',
      collapsed: true,
      children: [
        { id: 'test-2-1', label: '创建订单测试', tag: '测试点' }
      ]
    }],
  };
console.log('initialData',initialData)
  graph = new G6.TreeGraph({
      container: g6Container.value,
      width: g6Container.value.scrollWidth,
      height: g6Container.value.scrollHeight,
      modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node', { type: 'click-select', multiple: false }] },
      defaultNode: { type: 'flow-node', anchorPoints: [[0, 0.5], [1, 0.5]] },
      defaultEdge: { type: 'cubic-horizontal', style: { stroke: '#A0AEC0', lineWidth: 2 } },
      layout: { type: 'mindmap', direction: 'LR', getHGap: () => 100, getVGap: () => 30, getSide: () => 'right' },
  });

  colorizeNodeData(initialData);
  graph.data(initialData);
  graph.render();
  
  // ==========================================================
  // 关键修正：在渲染后手动调用，确保视图定位到正确位置
  // ==========================================================
  graph.fitView();

  // Event Handlers
  graph.on('node:dragstart', () => { isDragging = true; });
  graph.on('node:dragend', () => { setTimeout(() => { isDragging = false; }, 0); });
  graph.on('node:click', (e) => {
    if (isDragging) return; 
    const { item, target } = e;
    const targetName = target.get('name');
    if (targetName === 'collapse-expand-button' || targetName === 'collapse-expand-icon') {
        graph.updateItem(item, { collapsed: !item.getModel().collapsed });
        graph.layout(); 
    } else {
        graph.getNodes().forEach(node => graph.setItemState(node, 'selected', false));
        graph.setItemState(item, 'selected', true);
    }
  });
  graph.on('canvas:click', () => {
       graph.getNodes().forEach(node => graph.setItemState(node, 'selected', false));
  });
  graph.on('node:dblclick', (e) => {
    const node = e.item;
    const model = node.getModel();
    const { x, y, width: nodeWidth, height: nodeHeight } = node.getBBox();
    const point = graph.getCanvasByPoint(x, y);
    const textarea = document.createElement('textarea');
    textarea.value = model.label;
    textarea.style.position = 'absolute';
    textarea.style.zIndex = '10';
    textarea.style.background = '#F7FAFC';
    textarea.style.border = '1px solid #4299E1';
    textarea.style.resize = 'none';
    textarea.style.outline = 'none';
    textarea.style.fontFamily = 'inherit';
    textarea.style.fontSize = '14px';
    textarea.style.lineHeight = '1.4';
    textarea.style.padding = '4px';
    const padding = 12;
    const tagAreaWidth = padding + 55 + padding;
    textarea.style.top = `${point.y + 4}px`;
    textarea.style.left = `${point.x + tagAreaWidth}px`;
    textarea.style.width = `${nodeWidth - tagAreaWidth - padding + 4}px`;
    textarea.style.height = `${nodeHeight - 8}px`;
    g6Container.value.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const updateNode = () => {
        if (textarea.value.trim() !== "") {
            graph.updateItem(node, { label: textarea.value });
            graph.layout();
        }
        if (g6Container.value && g6Container.value.contains(textarea)) {
            g6Container.value.removeChild(textarea);
        }
    };
    textarea.addEventListener('blur', updateNode);
    textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            updateNode();
        }
    });
  });

  const resizeObserver = new ResizeObserver(() => {
    if (!graph || graph.get('destroyed')) return;
    graph.changeSize(g6Container.value.scrollWidth, g6Container.value.scrollHeight);
    graph.fitCenter();
  });
  resizeObserver.observe(g6Container.value);
  
});
onUnmounted(() => {
  resizeObserver.disconnect();
  graph.destroy();
});
// --- AI Generation Logic ---
const generateAndAppendChildren = async () => {
  const selectedNodes = graph.findAllByState('node', 'selected');
  if (selectedNodes.length === 0) {
    showToast('error', '请先选择一个节点', '您需要先单击一个父节点，才能为其追加子节点。');
    return;
  }
  const parentNode = selectedNodes[0];
  const parentId = parentNode.getID();
  isGenerating.value = true;
  try {
    const newLabels = await mockAIFetch(prompt.value);
    newLabels.forEach(label => {
      const newChildData = {
        id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        label: label,
        tag: '测试用例', // AI默认追加为最底层的“测试用例”
      };
      colorizeNodeData(newChildData);
      graph.addChild(newChildData, parentId);
    });
    // 展开父节点以显示新添加的子节点
    graph.updateItem(parentNode, { collapsed: false });
    await graph.layout();
    graph.focusItem(parentNode, true, { easing: 'easeCubic', duration: 500 });
    prompt.value = '';
    showToast('success', '节点已追加', `${newLabels.length}个新节点已成功添加。`);
  } catch (error) {
    showToast('error', '生成失败', error.message || '请稍后重试');
  } finally {
    isGenerating.value = false;
  }
};

const mockAIFetch = (textPrompt) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([ `AI对“${textPrompt.slice(0, 10)}”的分解`, '第二个子任务', '第三个想法' ]);
    }, 1000);
  });
};

const showToast = (type, title, description) => {
  toast.value = { show: true, type, title, description };
  setTimeout(() => { hideToast(); }, 3000);
};
const hideToast = () => { toast.value.show = false; };
</script>

<style>
.flow-editor-wrapper { width: 100%; height: 100%; box-sizing: border-box; }
.g6-container { width: 100%; height: 100%; position: relative; }
</style>