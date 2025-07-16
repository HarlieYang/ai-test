<template>
    <div class="h-screen" style="background-color: #f5f5f5;">
      <!-- 外层容器 - 浅灰色边框 -->
      <div class="h-full border border-gray-200 shadow-lg">
        <!-- 吸顶 Header -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div class="flex items-center justify-between px-6 py-3">
            <!-- 项目名称 -->
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h1 class="text-lg font-medium text-gray-900">AI 测试全链路</h1>
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">思维导图</span>
            </div>
            
            <!-- 右侧操作区 -->
            <div class="flex items-center space-x-2">
              <!-- 新建按钮 -->
              <button @click="openModal" class="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>新建</span>
              </button>
              
              <!-- 保存按钮 -->
              <button class="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <span>保存</span>
              </button>
              
              <!-- 导出按钮 -->
              <button
                @click="downloadImage"
                class="flex items-center space-x-1 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                <span>导出</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 主要内容区域 -->
        <div class="h-full p-4" style="height: calc(100vh - 60px);">
          <div class="grid grid-cols-12 gap-4 h-full">
      
            <div class="col-span-12 lg:col-span-9 bg-white border-r h-full">
              <div ref="g6Container" class="g6-container"></div>
            </div>
      
            <div class="col-span-12 lg:col-span-3 h-full flex flex-col bg-white">
                <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
                    <div v-for="msg in messages" :key="msg.id">
                    <div v-if="msg.role === 'assistant'" class="flex justify-start">
                        <div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-sm">
                        <p class="whitespace-pre-wrap">{{ msg.content }}</p>
                        </div>
                    </div>
                    <div v-if="msg.role === 'user'" class="flex justify-end">
                        <div class="bg-blue-600 text-white p-3 rounded-lg max-w-sm">
                        <p class="whitespace-pre-wrap">{{ msg.content }}</p>
                        </div>
                    </div>
                    </div>
                </div>

                <form @submit="handleSubmit" class="p-4 border-t border-gray-200">
                    <div class="relative">
                    <textarea
                        v-model="input"
                        @keydown.enter.exact.prevent="handleSubmit"
                        :disabled="isLoading"
                        placeholder="与AI对话来构建流程图..."
                        rows="3"
                        class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                    <button
                        type="submit"
                        :disabled="isLoading || !input.trim()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                        <Loader2Icon v-if="isLoading" class="h-5 w-5 animate-spin" />
                        <SendIcon v-else class="h-5 w-5" />
                    </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框组件 -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl">
          <!-- 模态框头部 -->
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-lg font-semibold text-gray-800">选择常用测试用例模板</h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- 模态框内容 -->
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <div v-for="template in templates" :key="template.id" class="p-3 mb-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors" @click="selectTemplate(template)">
              <h3 class="font-medium text-gray-800">{{ template.title }}</h3>
              <p class="text-sm text-gray-600">{{ template.description }}</p>
            </div>
          </div>
          
          <!-- 模态框底部 -->
          <div class="flex justify-end p-4 border-t">
            <button @click="closeModal" class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              取消
            </button>
            <button @click="createFromTemplate" class="ml-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              使用此模板
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 新增的模态框结构 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">选择测试用例模版</h2>
        <ul class="space-y-2">
          <li class="p-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer">正确用户名密码</li>
          <li class="p-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer">错误密码</li>
          <li class="p-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer">注册流程测试</li>
        </ul>
        <div class="mt-4 flex justify-end">
          <button @click="closeModal" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">关闭</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import G6 from '@antv/g6';
  import { Send, Loader2 } from 'lucide-vue-next';
  import { useChat } from 'ai/vue';
  
  // --- NEW: Header功能函数 ---
const downloadImage = () => {
  if (!graph) return;
  
  // 获取画布内容并转换为图片
  const canvas = graph.get('canvas').get('el');
  const dataURL = canvas.toDataURL('image/png');
  
  // 创建下载链接
  const link = document.createElement('a');
  link.download = 'AI测试全链路-思维导图.png';
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportData = () => {
  if (!graph) return;
  
  // 获取图表数据
  const data = graph.save();
  const jsonString = JSON.stringify(data, null, 2);
  
  // 创建下载链接
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'AI测试全链路-思维导图数据.json';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- NEW: State Management for Conversational UI ---
const SendIcon = Send;
const Loader2Icon = Loader2;
const messageContainer = ref(null); // 用于自动滚动

// 模态框状态
const isModalOpen = ref(false);
const showModal = ref(false);
const templates = ref([
  { id: 1, title: '登录测试用例', description: '包含正确和错误的用户名密码组合' },
  { id: 2, title: '注册测试用例', description: '包含正常注册流程和异常情况' },
  { id: 3, title: '订单处理测试用例', description: '涵盖创建订单、支付、取消订单等流程' },
]);
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};
// Vercel AI SDK Hook
const { messages, input, handleSubmit, isLoading } = useChat({
  api: 'https://1317858117-9fz770xik0.ap-shanghai.tencentscf.com', // 这是您的后端API端点
  body: {
    prompt: "登录测试用例"
  },
  initialInput: '请输入你的需求',
  onResponse: () => {
    return '测试话语'
  },
  // onFinish 会在AI流式响应完全结束后被调用
  onFinish: (message) => {
    // message.data 中包含了后端通过数据流发送的G6指令
    handleG6Action([
        {
            type: 'ADD_CHILDREN',
            payload: [
                '测试用例111'
            ]
        }
    ])
    // if (message.data) {
    //   handleG6Action(message.data);
    // }
  }
});

// --- NEW: Function to execute G6 actions from AI ---
const handleG6Action = (actions) => {
  if (!Array.isArray(actions)) {
    console.error("Received non-array G6 action:", actions);
    return;
  }

  const selectedNodes = graph.findAllByState('node', 'selected');
  if (selectedNodes.length === 0) {
    // 如果没有选中节点，可以选择一个默认行为，比如添加到根节点
    console.warn("G6 action received, but no node is selected.");
    // 可以在这里添加一个 toast 提示用户
    return;
  }
  const parentNode = selectedNodes[0];

  actions.forEach(action => {
    const { type, payload } = action;
    if (type === 'ADD_CHILDREN') {
      payload.forEach(childLabel => {
        const newChildData = {
          id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          label: childLabel,
          tag: '测试用例', // AI 默认追加为"测试用例"
        };
        colorizeNodeData(newChildData); // 复用您已有的着色函数
        graph.addChild(newChildData, parentNode.getID());
      });
    }
    //未来可以扩展更多action type, e.g., 'DELETE_NODE'
  });

  // 完成操作后，展开父节点，更新布局并聚焦
  graph.updateItem(parentNode, { collapsed: false });
  graph.layout();
  graph.focusItem(parentNode, true, { easing: 'easeCubic', duration: 500 });
};

// --- NEW: Auto-scroll chat to bottom ---
watch(messages, () => {
  // 使用 nextTick 确保DOM已经更新
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}, { deep: true });

  // --- State Management ---
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
      },
      { 
        id: 'func-3', 
        label: '支付模块',
        tag: '功能点',
        children: [
          { id: 'test-3-1', label: '支付流程测试', tag: '测试点' },
          { id: 'test-3-2', label: '退款流程测试', tag: '测试点' }
        ]
      },
      { 
        id: 'func-4', 
        label: '用户反馈与评价',
        tag: '功能点',
        children: [
          { id: 'test-4-1', label: '反馈提交测试', tag: '测试点' },
          { id: 'test-4-2', label: '评价系统测试', tag: '测试点' }
        ]
      },
      { 
        id: 'func-5', 
        label: '数据统计与分析',
        tag: '功能点',
        children: [
          { id: 'test-5-1', label: '用户行为分析', tag: '测试点' },
          { id: 'test-5-2', label: '销售数据统计', tag: '测试点' }
        ]
      }
      ],
    };
  
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
  
    onUnmounted(() => {
      resizeObserver.disconnect();
      graph.destroy();
    });
  });
  
  </script>
  
  <style>
  .flow-editor-wrapper { width: 100%; height: 100%; box-sizing: border-box; }
  .g6-container { width: 100%; height: 100%; position: relative; }
  </style>