import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient('https://kiykpwllalwweexaqgyu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeWtwd2xsYWx3d2VleGFxZ3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzUyNTAsImV4cCI6MjA5MTkxMTI1MH0.zR9r1MCXO6Ziw7_Y0mmG6E4CvSvEEPiM4Rrsqo37c_s')

let allBookmarks = []
let sortColumn = 'created_at'
let sortDirection = 'desc'

export async function signUp() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signUp({ email, password })
  document.getElementById('auth-message').textContent = error
    ? error.message
    : 'Check your email to confirm signup!'
}

export async function signIn() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    document.getElementById('auth-message').textContent = error.message
  } else {
    showBookmarkSection()
  }
}

export async function signOut() {
  await supabase.auth.signOut()
  document.getElementById('auth-section').style.display = 'block'
  document.getElementById('bookmark-section').style.display = 'none'
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session) showBookmarkSection()
})

function showBookmarkSection() {
  document.getElementById('auth-section').style.display = 'none'
  document.getElementById('bookmark-section').style.display = 'block'
  loadBookmarks()
}

export async function addBookmark() {
  const url = document.getElementById('url').value
  const title = document.getElementById('title').value
  const notes = document.getElementById('notes').value
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('bookmarks').insert({ url, title, notes, user_id: user.id })
  if (error) {
    alert(error.message)
  } else {
    document.getElementById('url').value = ''
    document.getElementById('title').value = ''
    document.getElementById('notes').value = ''
    loadBookmarks()
  }
}

async function loadBookmarks() {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return }
  allBookmarks = data
  renderTable()
}

export function sortTable(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn = column
    sortDirection = 'asc'
  }
  document.querySelectorAll('th').forEach(th => th.classList.remove('active'))
  document.getElementById('header-' + column)?.classList.add('active')
  renderTable()
}

function renderTable() {
  const sorted = [...allBookmarks].sort((a, b) => {
    const valA = (a[sortColumn] || '').toLowerCase()
    const valB = (b[sortColumn] || '').toLowerCase()
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const icon = sortDirection === 'asc' ? '↑' : '↓'
  document.querySelectorAll('th .sort-icon').forEach(el => el.textContent = '⇅')
  const activeHeader = document.getElementById('header-' + sortColumn)
  if (activeHeader) activeHeader.querySelector('.sort-icon').textContent = icon

  document.getElementById('bookmark-list').innerHTML = sorted.map(b => `
    <tr>
      <td><a href="${b.url}" target="_blank">${b.url}</a></td>
      <td>${b.title || ''}</td>
      <td><button class="delete-btn" onclick="deleteBookmark('${b.id}')">Delete</button></td>
    </tr>
  `).join('')
}

export async function deleteBookmark(id) {
  const { error } = await supabase.from('bookmarks').delete().eq('id', id)
  if (!error) loadBookmarks()
}