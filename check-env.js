import fs from 'fs';
import path from 'path';

console.log('🔍 检查项目环境配置...\n');

const checks = [
  {
    name: '后端 .env 文件',
    path: './backend/.env',
    required: true,
    vars: ['PORT', 'BOT_TOKEN', 'DATABASE_PATH', 'NODE_ENV']
  },
  {
    name: '前端 .env 文件',
    path: './frontend/.env',
    required: false,
    vars: ['VITE_API_URL']
  },
  {
    name: '后端依赖',
    path: './backend/node_modules',
    required: true
  },
  {
    name: '前端依赖',
    path: './frontend/node_modules',
    required: true
  },
  {
    name: '根依赖',
    path: './node_modules',
    required: true
  }
];

let hasIssues = false;

checks.forEach(check => {
  const exists = fs.existsSync(check.path);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${exists ? '存在' : '不存在'}`);
  
  if (!exists) {
    if (check.required) {
      hasIssues = true;
      if (check.path.includes('node_modules')) {
        console.log(`   💡 解决：运行 'npm install' 在 ${path.dirname(check.path)} 目录`);
      } else if (check.path.endsWith('.env')) {
        console.log(`   💡 解决：复制 ${check.path}.example 为 ${check.path}`);
      }
    }
  } else if (check.vars && check.path.endsWith('.env')) {
    const content = fs.readFileSync(check.path, 'utf-8');
    check.vars.forEach(varName => {
      const hasVar = content.includes(`${varName}=`);
      const varIcon = hasVar ? '  ✓' : '  ⚠️';
      console.log(`${varIcon} ${varName}: ${hasVar ? '已配置' : '未配置'}`);
      if (!hasVar && check.required) {
        hasIssues = true;
      }
    });
  }
  console.log();
});

console.log('━'.repeat(50));
if (hasIssues) {
  console.log('❌ 发现配置问题，请按照上述提示修复\n');
  process.exit(1);
} else {
  console.log('✅ 环境检查通过！\n');
  console.log('🚀 运行以下命令启动项目:');
  console.log('   npm run dev\n');
  process.exit(0);
}
