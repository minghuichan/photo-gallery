<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ store.images.length }}</div>
            <div class="stat-label">图片总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayCount }}</div>
            <div class="stat-label">今日上传</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon><Files /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatSize(totalSize) }}</div>
            <div class="stat-label">存储使用</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon><CollectionTag /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ tagCount }}</div>
            <div class="stat-label">标签种类</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近上传 -->
    <el-card class="recent-card">
      <template #header>
        <div class="card-header">
          <span>最近上传</span>
          <el-button type="primary" @click="$router.push('/admin/gallery')">
            管理相册
          </el-button>
        </div>
      </template>
      
      <el-table :data="recentImages" style="width: 100%">
        <el-table-column prop="name" label="图片名称" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" class="mr-1">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="action-buttons">
            <el-button type="primary" @click="$router.push('/admin/gallery')">
              <el-icon><Upload /></el-icon>
              上传图片
            </el-button>
            <el-button @click="$router.push('/')">
              <el-icon><View /></el-icon>
              预览网站
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>系统信息</span>
          </template>
          <ul class="system-info">
            <li>系统版本: 1.0.0</li>
            <li>Vue 版本: 3.3.4</li>
            <li>Element Plus: 2.3.14</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Picture, Calendar, Files, CollectionTag, Upload, View } from '@element-plus/icons-vue'
import { useGalleryStore } from '@/stores/useGallery'

const store = useGalleryStore()

// 今日上传数量
const todayCount = computed(() => {
  const today = new Date().toLocaleDateString('zh-CN')
  return store.images.filter(img =>
    img.uploadTime.includes(today)
  ).length
})

// 总存储大小
const totalSize = computed(() => {
  return store.images.reduce((sum, img) => sum + (img.size || 0), 0)
})

// 标签种类
const tagCount = computed(() => {
  const tags = new Set()
  store.images.forEach(img => {
    img.tags?.forEach(tag => tags.add(tag))
  })
  return tags.size
})

// 最近上传的图片
const recentImages = computed(() => {
  return store.images.slice(0, 5)
})

// 格式化文件大小
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.recent-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mr-1 {
  margin-right: 4px;
}

.quick-actions .el-card {
  height: 160px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.system-info {
  list-style: none;
  padding: 0;
  margin: 0;
}

.system-info li {
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
}

.system-info li:last-child {
  border-bottom: none;
}
</style>
