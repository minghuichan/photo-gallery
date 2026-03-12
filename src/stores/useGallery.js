import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'

const DB_NAME = 'gallery_db'
const STORE_NAME = 'images'

// 打开数据库
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

// 从数据库获取所有图片
function getAllFromDB() {
  return new Promise((resolve, reject) => {
    openDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    }).catch(reject)
  })
}

// 添加图片到数据库
function addToDB(img) {
  return new Promise((resolve, reject) => {
    openDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      // 转换为普通对象，避免 Vue 响应式对象无法克隆
      const rawImg = toRaw(img)
      const request = store.add(rawImg)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    }).catch(reject)
  })
}

// 从数据库删除图片
function deleteFromDB(id) {
  return new Promise((resolve, reject) => {
    openDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    }).catch(reject)
  })
}

// 更新数据库中的图片
function updateInDB(img) {
  return new Promise((resolve, reject) => {
    openDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      // 转换为普通对象，避免 Vue 响应式对象无法克隆
      const rawImg = toRaw(img)
      const request = store.put(rawImg)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    }).catch(reject)
  })
}

export const useGalleryStore = defineStore('gallery', () => {
  const images = ref([])
  const searchKeyword = ref('')
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  let loaded = false

  // 过滤后的图片
  const filteredImages = computed(() => {
    if (!searchKeyword.value) return images.value
    const keyword = searchKeyword.value.toLowerCase()
    return images.value.filter(img => 
      img.name.toLowerCase().includes(keyword) ||
      img.tags?.some(tag => tag.toLowerCase().includes(keyword))
    )
  })

  // 从数据库加载
  async function loadImages() {
    if (loaded) return // 防止重复加载
    try {
      const result = await getAllFromDB()
      images.value = result
      loaded = true
      console.log('✅ 已加载', images.value.length, '张图片')
    } catch (e) {
      console.error('加载失败:', e)
    }
  }

  // 添加图片
  async function addImage(data) {
    const img = {
      id: Date.now(),
      name: data.name || '未命名',
      url: data.url,
      thumbnail: data.thumbnail || data.url,
      size: data.size || 0,
      uploadTime: new Date().toLocaleString('zh-CN'),
      tags: data.tags || []
    }

    try {
      await addToDB(img)
      images.value.unshift(img)
      console.log('✅ 已保存:', img.name)
      return img
    } catch (e) {
      console.error('保存失败:', e)
      throw e
    }
  }

  // 删除图片
  async function deleteImage(id) {
    try {
      await deleteFromDB(id)
      const idx = images.value.findIndex(img => img.id === id)
      if (idx > -1) images.value.splice(idx, 1)
      console.log('✅ 已删除:', id)
    } catch (e) {
      console.error('删除失败:', e)
    }
  }

  // 更新图片
  async function updateImage(id, data) {
    const img = images.value.find(i => i.id === id)
    if (img) {
      Object.assign(img, data)
      try {
        await updateInDB(img)
        console.log('✅ 已更新:', img.name)
      } catch (e) {
        console.error('更新失败:', e)
      }
    }
  }

  return {
    images,
    searchKeyword,
    isUploading,
    uploadProgress,
    filteredImages,
    loadImages,
    addImage,
    deleteImage,
    updateImage,
    setSearchKeyword: (k) => { searchKeyword.value = k }
  }
})
