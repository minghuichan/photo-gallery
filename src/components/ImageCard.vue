<template>
  <div class="image-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="image-wrapper">
      <el-image
        :src="image.thumbnail"
        :zoom-rate="1.2"
        :preview-src-list="[image.url]"
        fit="cover"
        class="image"
        loading="lazy"
      >
        <template #error>
          <div class="image-error">
            <el-icon><PictureFilled /></el-icon>
          </div>
        </template>
      </el-image>

      <!-- 悬停操作按钮 -->
      <transition name="fade">
        <div v-if="isHovered" class="overlay">
          <div class="actions">
            <el-button
              type="primary"
              size="small"
              :icon="Download"
              circle
              @click.stop="handleDownload"
              title="下载"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click.stop="handleDelete"
              title="删除"
            />
          </div>
        </div>
      </transition>
    </div>

    <div class="card-info">
      <h3 class="image-name" :title="image.name">{{ image.name }}</h3>
      <div class="image-meta">
        <span class="meta-item">
          <el-icon><Clock /></el-icon>
          {{ image.uploadTime }}
        </span>
        <span class="meta-item">
          <el-icon><Files /></el-icon>
          {{ formatSize(image.size) }}
        </span>
      </div>
      <div class="image-tags">
        <el-tag
          v-for="tag in image.tags"
          :key="tag"
          size="small"
          type="info"
          class="tag"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 下载重命名对话框 -->
    <el-dialog
      v-model="downloadDialogVisible"
      title="下载图片"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="downloadForm" label-width="80px">
        <el-form-item label="文件名">
          <el-input
            v-model="downloadForm.fileName"
            placeholder="请输入文件名"
            :suffix="'.png'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="downloadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDownload">确定下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Delete, PictureFilled, Clock, Files } from '@element-plus/icons-vue'

const props = defineProps({
  image: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'download'])

const isHovered = ref(false)
const downloadDialogVisible = ref(false)
const downloadForm = ref({
  fileName: ''
})

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleDownload = () => {
  downloadForm.value.fileName = props.image.name
  downloadDialogVisible.value = true
}

const confirmDownload = async () => {
  if (!downloadForm.value.fileName.trim()) {
    ElMessage.warning('请输入文件名')
    return
  }

  try {
    const response = await fetch(props.image.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${downloadForm.value.fileName}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
    downloadDialogVisible.value = false
    emit('download', props.image)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleDelete = () => {
  ElMessageBox.confirm(
    `确定要删除图片"${props.image.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('delete', props.image.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.image-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #f5f7fa;
}

.image {
  width: 100%;
  display: block;
}

.image :deep(.el-image__inner) {
  transition: transform 0.3s ease;
}

.image-card:hover .image :deep(.el-image__inner) {
  transform: scale(1.05);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200px;
  background: #f5f7fa;
  color: #909399;
  font-size: 48px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.actions {
  display: flex;
  gap: 12px;
}

.actions .el-button {
  width: 40px;
  height: 40px;
}

.card-info {
  padding: 14px;
}

.image-name {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
