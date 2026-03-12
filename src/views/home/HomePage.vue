<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <header class="home-header">
      <div class="header-content">
        <h1 class="logo">📸 相册展示</h1>
        <nav class="nav-links">
          <el-button type="primary" link @click="$router.push('/login')">
            <el-icon><User /></el-icon>
            管理登录
          </el-button>
        </nav>
      </div>
    </header>

    <!-- 搜索栏 -->
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索图片..."
        :prefix-icon="Search"
        clearable
        size="large"
        class="search-input"
        @input="handleSearch"
      />
    </div>

    <!-- 图片展示 -->
    <main class="gallery-section">
      <div class="masonry" v-if="displayImages.length > 0">
        <div
          v-for="(image, index) in displayImages"
          :key="image.id"
          class="masonry-item"
          :style="{ animationDelay: `${index * 0.03}s` }"
          @click="openLightbox(index)"
        >
          <div class="image-card">
            <div class="image-wrapper">
              <el-image :src="image.thumbnail" fit="cover" class="preview-img" loading="lazy">
                <template #placeholder>
                  <div class="image-loading"><div class="loading-spinner"></div></div>
                </template>
                <template #error>
                  <div class="image-error"><el-icon><PictureFilled /></el-icon></div>
                </template>
              </el-image>
              <div class="image-overlay">
                <el-icon class="zoom-icon"><ZoomIn /></el-icon>
              </div>
            </div>
            <div class="image-info">
              <h3>{{ image.name }}</h3>
              <div class="tags" v-if="image.tags?.length">
                <el-tag v-for="tag in image.tags.slice(0, 2)" :key="tag" size="small" effect="plain" round>
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore && displayImages.length > 0">
        <el-button @click="loadMore" :loading="loading">加载更多</el-button>
      </div>
      
      <!-- 没有更多 -->
      <div class="no-more" v-if="!hasMore && displayImages.length > 0">
        <span>已展示全部 {{ store.filteredImages.length }} 张图片</span>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="displayImages.length === 0" :description="searchKeyword ? '没有找到匹配的图片' : '暂无图片'">
        <el-button type="primary" @click="$router.push('/login')">去上传</el-button>
      </el-empty>
    </main>

    <!-- 全屏灯箱预览 -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="lightboxVisible" class="lightbox" @click.self="closeLightbox">
          <!-- 关闭按钮 -->
          <button class="lightbox-close" @click="closeLightbox">✕</button>
          
          <!-- 上一张 -->
          <button class="lightbox-nav prev" @click="prevImage" v-if="currentIndex > 0">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          
          <!-- 图片 -->
          <div class="lightbox-content">
            <img :src="currentImage?.url" :alt="currentImage?.name" class="lightbox-img" />
            <div class="lightbox-info">
              <h3>{{ currentImage?.name }}</h3>
              <p>{{ currentImage?.uploadTime }}</p>
            </div>
          </div>
          
          <!-- 下一张 -->
          <button class="lightbox-nav next" @click="nextImage" v-if="currentIndex < displayImages.length - 1">
            <el-icon><ArrowRight /></el-icon>
          </button>
          
          <!-- 计数器 -->
          <div class="lightbox-counter">
            {{ currentIndex + 1 }} / {{ displayImages.length }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 页脚 -->
    <footer class="home-footer">
      <p>© 2024 相册管理系统</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, User, PictureFilled, ZoomIn, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useGalleryStore } from '@/stores/useGallery'

const store = useGalleryStore()
const searchKeyword = ref('')

// 分页相关
const pageSize = 20
const currentPage = ref(1)
const loading = ref(false)

const displayImages = computed(() => {
  const start = 0
  const end = currentPage.value * pageSize
  return store.filteredImages.slice(start, end)
})

const hasMore = computed(() => {
  return displayImages.value.length < store.filteredImages.length
})

const loadMore = () => {
  loading.value = true
  setTimeout(() => {
    currentPage.value++
    loading.value = false
  }, 300)
}

// 灯箱预览
const lightboxVisible = ref(false)
const currentIndex = ref(0)

const currentImage = computed(() => displayImages.value[currentIndex.value])

const openLightbox = (index) => {
  currentIndex.value = index
  lightboxVisible.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxVisible.value = false
  document.body.style.overflow = ''
}

const prevImage = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextImage = () => {
  if (currentIndex.value < displayImages.value.length - 1) currentIndex.value++
}

// 键盘导航
const handleKeydown = (e) => {
  if (!lightboxVisible.value) return
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'Escape') closeLightbox()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  store.loadImages() // 加载图片数据
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleSearch = (value) => {
  store.setSearchKeyword(value)
  currentPage.value = 1 // 搜索时重置页码
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.home-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.search-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px 24px;
}

.search-section .search-input {
  max-width: 500px;
  margin: 0 auto;
  display: block;
}

.search-section :deep(.el-input__wrapper) {
  border-radius: 24px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
}

.gallery-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 瀑布流布局 */
.masonry {
  column-count: 4;
  column-gap: 16px;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.image-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
}

.image-card :deep(.el-image) {
  width: 100%;
  display: block;
  transition: transform 0.4s;
}

.image-card:hover :deep(.el-image__inner) {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.zoom-icon {
  font-size: 32px;
  color: #fff;
}

.image-loading {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e4e7ed;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 48px;
}

.image-info {
  padding: 12px;
}

.image-info h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 32px;
}

.no-more {
  text-align: center;
  padding: 24px;
  color: #909399;
  font-size: 13px;
}

/* 全屏灯箱 */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav.prev { left: 20px; }
.lightbox-nav.next { right: 20px; }

.lightbox-content {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.lightbox-info {
  text-align: center;
  margin-top: 16px;
  color: #fff;
}

.lightbox-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
}

.lightbox-info p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.lightbox-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 16px;
  border-radius: 20px;
}

/* 灯箱动画 */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.home-footer {
  background: #fff;
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 13px;
  border-top: 1px solid #ebeef5;
}

.home-footer p {
  margin: 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .masonry { column-count: 3; }
}

@media (max-width: 900px) {
  .masonry { column-count: 2; }
}

@media (max-width: 600px) {
  .masonry { column-count: 1; }
  .gallery-section { padding: 16px; }
  .lightbox-nav { width: 40px; height: 40px; }
  .lightbox-nav.prev { left: 10px; }
  .lightbox-nav.next { right: 10px; }
}
</style>
