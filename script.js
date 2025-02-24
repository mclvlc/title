document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const mainContent = document.querySelector('.main-content');
    const bgImage = new Image();
    
    // 新增音频预加载
    const bgm = new Audio('./source/bgm.mp3');
    bgm.preload = 'auto';

    const timeout = setTimeout(() => {
      document.querySelector('.loading-text').textContent = 
        '这么长时间还没加载好，你这网络是有多差啊';
    }, 10000);
  
    // 修改为同时加载背景图和音频
    Promise.all([
      new Promise(resolve => {
        bgImage.src = './images/bg.png';
        bgImage.onload = resolve;
      }),
      new Promise(resolve => {
        bgm.addEventListener('canplaythrough', resolve);
      })
    ]).then(() => {
      clearTimeout(timeout);
      loadingScreen.style.display = 'none';
      mainContent.style.display = 'flex';
    }).catch(() => {
      clearTimeout(timeout);
      loadingScreen.style.display = 'none';
      mainContent.style.display = 'flex';
    });
  
    const generateBtn = document.getElementById('generate-btn');
    const nameInput = document.getElementById('name-input');
    const errorMessage = document.querySelector('.error-message');
    
    generateBtn.addEventListener('click', generateCertificate);
  
    document.getElementById('appeal-btn').addEventListener('click', () => {
      updateTitle();
      // 移除此处自动播放音乐的逻辑
    });
  
    async function generateCertificate() {
      if (!nameInput.value.trim()) {
        generateBtn.classList.add('shake');
        errorMessage.style.display = 'block';
        setTimeout(() => {
          generateBtn.classList.remove('shake');
          errorMessage.style.display = 'none';
        }, 5000);
        return;
      }
  
      showCertificate();
    }
  
    async function showCertificate() {
      document.getElementById('user-name').textContent = nameInput.value.trim();
      mainContent.style.display = 'none';
      
      // 使用预加载的音频对象
      bgm.volume = 0.3;
      bgm.currentTime = 0;  // 新增重置播放进度
      bgm.play().catch(error => {
        console.log('自动播放被阻止，需要用户交互');
      });
      
      document.querySelector('.certificate-container').style.display = 'flex';
      document.getElementById('appeal-btn').style.display = 'block';
      updateTitle();
      setDateTime();
    }
  
    // 在文件开头添加最近生成记录
    let recentTitles = [];
    const MAX_RECENT = 5; // 记忆最近5个生成的称号
    function updateTitle() {
      fetch('./titles.json')
        .then(response => response.json())
        .then(titles => {
          // 增强型防重复逻辑
          const candidatePool = titles.filter(title => 
            !recentTitles.includes(title)
          );
          
          // 当候选池较小时增加基础池的权重
          const finalPool = candidatePool.length > (titles.length / 2) 
            ? candidatePool 
            : [...candidatePool, ...titles.slice(0, 3)];
  
          // 使用更均匀的随机算法
          const shuffled = finalPool
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
  
          const title = shuffled[0].replace('xxxx', new Date().getFullYear());
          
          // 扩大记忆库到10个
          recentTitles = [title, ...recentTitles.slice(0, 9)]; 
          
          document.getElementById('title-text').textContent = title;
        });
    }
  
    function setDateTime() {
      const now = new Date();
      const dateStr = `${now.getFullYear()}年\n${now.getMonth()+1}月${now.getDate()}日`;
      document.getElementById('date-text').innerHTML = dateStr.replace('\n', '<br>');
    }
  });
// 删除最后添加的证书容器点击事件监听器
// 原代码结尾的这段需要删除：
// document.querySelector('.certificate-container').addEventListener('click', () => {
//   document.getElementById('bgm').play();
// });