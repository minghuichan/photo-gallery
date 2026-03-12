<template>
  <div class="gallery-manage">
    <!-- 工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索图片..."
            :prefix-icon="Search"
            clearable
            style="width: 240px"
            @input="handleSearch"
          />
          <span class="count-text">共 {{ store.filteredImages.length }} 张图片</span>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" :icon="Plus" @click="openUploadModal">
            上传图片
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 图片列表 -->
    <el-card class="gallery-card">
      <div class="image-grid" v-if="store.filteredImages.length > 0">
        <div
          v-for="image in store.filteredImages"
          :key="image.id"
          class="image-item"
        >
          <div class="image-preview">
            <el-image
              :src="image.thumbnail"
              fit="cover"
              :preview-src-list="[image.url]"
              class="preview-img"
            />
            <div class="image-actions">
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                circle
                @click="openEditDialog(image)"
              />
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                circle
                @click="handleDelete(image)"
              />
            </div>
          </div>
          <div class="image-info">
            <div class="image-name" :title="image.name">{{ image.name }}</div>
            <div class="image-meta">
              <span>{{ formatSize(image.size) }}</span>
              <span>{{ image.uploadTime }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无图片" />
    </el-card>

    <!-- 上传弹窗 -->
    <UploadModal
      v-model="uploadModalVisible"
      @success="handleUploadSuccess"
    />

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑图片信息"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="图片名称">
          <el-input v-model="editForm.name" maxlength="50" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="editForm.tags"
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
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UploadModal from '@/components/UploadModal.vue'
import { useGalleryStore } from '@/stores/useGallery'

const store = useGalleryStore()
const searchKeyword = ref('')
const uploadModalVisible = ref(false)
const editDialogVisible = ref(false)
const editForm = ref({
  id: null,
  name: '',
  tags: []
})

const commonTags = ['风景', '人物', '动物', '植物', '建筑', '美食', '旅行', '生活', '艺术', '科技']

const handleSearch = (value) => {
  store.setSearchKeyword(value)
}

const openUploadModal = () => {
  uploadModalVisible.value = true
}

const handleUploadSuccess = () => {
  // 只在 UploadModal 组件中显示提示，这里不再重复
  console.log('上传完成，刷新列表')
}

const openEditDialog = (image) => {
  editForm.value = {
    id: image.id,
    name: image.name,
    tags: [...(image.tags || [])]
  }
  editDialogVisible.value = true
}

const saveEdit = () => {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('请输入图片名称')
    return
  }
  
  store.updateImage(editForm.value.id, {
    name: editForm.value.name,
    tags: editForm.value.tags
  })
  
  ElMessage.success('保存成功')
  editDialogVisible.value = false
}

const handleDelete = (image) => {
  ElMessageBox.confirm(
    `确定要删除图片"${image.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    store.deleteImage(image.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.gallery-manage {
  padding: 0;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.count-text {
  font-size: 14px;
  color: #909399;
}

.gallery-card {
  min-height: 400px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.image-preview {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.image-info {
  padding: 12px;
}

.image-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}
</style>
