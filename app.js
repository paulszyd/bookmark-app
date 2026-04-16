import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient('https://kiykpwllalwweexaqgyu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeWtwd2xsYWx3d2VleGFxZ3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzUyNTAsImV4cCI6MjA5MTkxMTI1MH0.zR9r1MCXO6Ziw7_Y0mmG6E4CvSvEEPiM4Rrsqo37c_s')

// Auth functions
export async function signUp() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    document.getElementById('auth-message').textContent = error.message
  } else {
    document.getElementById('auth-message').textContent = 'Check your email to confirm signup!'
  }
}

export async function signIn() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signIn({ email, password })
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

// Check if already logged in on page load
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    showBookmarkSection()
  }
})

function showBookmarkSection() {
  document.getElementById('auth-section').style.display = 'none'
  document.getElementById('bookmark-section').style.display = 'block'
  loadBookmarks()
}

// Bookmark functions
export async function addBookmark() {
  const url = document.getElementById('url').value
  const title = document.getElementById('title').value
  const notes = document.getElementById('notes').value

const { data: { user } } = await supabase.auth.getUser()

const { error } = await supabase
  .from('bookmarks')
  .insert({ url, title, notes, user_id: user.id })

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

  if (error) {
    console.error(error)
    return
  }

  const list = document.getElementById('bookmark-list')
  list.innerHTML = data.map(b => `
    <div class="bookmark-card">
      <a href="${b.url}" target="_blank">${b.title || b.url}</a>
      <p>${b.notes || ''}</p>
      <button onclick="deleteBookmark('${b.id}')">Delete</button>
    </div>
  `).join('')
}

export async function deleteBookmark(id) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)

  if (!error) loadBookmarks()
}