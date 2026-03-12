<template>
  <el-dialog
    v-model="visible"
    title="上传图片"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="upload-modal"
  >
    <div class="upload-content">
      <!-- 拖拽上传区域 -->
      <div
        class="drop-zone"
        :class="{ 'is-dragging': isDragging, 'has-file': !!previewFile }"
        @dragenter.prevent="handleDragEnter"
        @dragleave.prevent="handleDragLeave"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleFileSelect"
        />

        <template v-if="!previewFile">
          <div class="upload-placeholder">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <p class="upload-text">拖拽图片到这里或点击上传</p>
            <p class="upload-hint">支持 JPG、PNG、GIF 格式，单个文件不超过 10MB</p>
          </div>
        </template>

        <template v-else>
          <div class="preview-container">
            <img :src="previewUrl" alt="预览" class="preview-image" />
            <div class="preview-info">
              <p class="preview-name">{{ previewFile.name }}</p>
              <p class="preview-size">{{ formatSize(previewFile.size) }}</p>
            </div>
            <el-button
              type="danger"
              size="small"
              :icon="Close"
              circle
              class="remove-btn"
              @click.stop="removeFile"
            />
          </div>
        </template>
      </div>

      <!-- 图片信息表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="upload-form"
      >
        <el-form-item label="图片名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入图片名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 上传进度 -->
      <div v-if="store.isUploading" class="progress-container">
        <el-progress
          :percentage="Math.round(store.uploadProgress)"
          :status="store.uploadProgress === 100 ? 'success' : ''"
          :stroke-width="8"
          striped
          striped-flow
        />
        <p class="progress-text">
          {{ store.uploadProgress === 100 ? '上传完成！' : '正在上传...' }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="store.isUploading"
          :disabled="!previewFile"
          @click="handleUpload"
        >
          {{ store.isUploading ? '上传中...' : '开始上传' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Close } from '@element-plus/icons-vue'
import { useGalleryStore } from '@/stores/useGallery'

const store = useGalleryStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const fileInput = ref(null)
const isDragging = ref(false)
const previewFile = ref(null)
const previewUrl = ref('')
const formRef = ref(null)

const form = ref({
  name: '',
  tags: []
})

const rules = {
  name: [
    { required: true, message: '请输入图片名称', trigger: 'blur' }
  ]
}

const commonTags = ['风景', '人物', '动物', '植物', '建筑', '美食', '旅行', '生活', '艺术', '科技']

// 监听对话框显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (!val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFiles(files[0])
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    handleFiles(files[0])
  }
}

const handleFiles = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 10MB')
    return
  }

  previewFile.value = file
  form.value.name = file.name.replace(/\.[^/.]+$/, '')
  previewUrl.value = URL.createObjectURL(file)
}

const removeFile = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewFile.value = null
  previewUrl.value = ''
  form.value.name = ''
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (!previewFile.value) {
    ElMessage.warning('请先选择图片')
    return
  }

  try {
    await formRef.value?.validate()

    // 转换为 base64
    const base64Url = await fileToBase64(previewFile.value)

    // 直接添加图片（转换为普通对象，避免 Vue 响应式对象无法被 IndexedDB 克隆）
    await store.addImage({
      name: form.value.name,
      url: base64Url,
      thumbnail: base64Url,
      size: previewFile.value.size,
      tags: [...form.value.tags]  // 转换为普通数组
    })

    ElMessage.success('上传成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  }
}

// 将文件转换为 base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handleClose = () => {
  visible.value = false
}

const resetForm = () => {
  removeFile()
  form.value.tags = []
  formRef.value?.resetFields()
}
</script>

<style scoped>
.upload-content {
  padding: 0 8px;
}

.drop-zone {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  margin-bottom: 20px;
}

.drop-zone:hover,
.drop-zone.is-dragging {
  border-color: #409eff;
  background: #ecf5ff;
}

.drop-zone.has-file {
  padding: 20px;
}

.upload-placeholder {
  pointer-events: none;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 15px;
  color: #606266;
  margin: 0 0 8px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.preview-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.preview-info {
  flex: 1;
  text-align: left;
}

.preview-name {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
}

.preview-size {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.remove-btn {
  flex-shrink: 0;
}

.upload-form {
  margin-top: 20px;
}

.progress-container {
  margin-top: 20px;
}

.progress-text {
  text-align: center;
  font-size: 13px;
  color: #606266;
  margin: 8px 0 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
