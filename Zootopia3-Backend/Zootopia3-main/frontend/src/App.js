import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { Phone, Mail, Search, User, LogIn, Sparkles } from 'lucide-react';

const ROLE_LABELS = {
  admin: 'Администратор',
  seller: 'Продавец',
  client: 'Клиент',
};

const PAYMENT_LABELS = {
  card: 'Банковская карта',
  cash: 'Наличные при получении',
};

const SPECIES_LABELS = {
  dog: 'Собака',
  cat: 'Кошка',
  bird: 'Птица',
  fish: 'Рыба',
  rodent: 'Грызун',
  other: 'Другое',
};

function roleLabel(role) {
  if (!role) return '';
  return ROLE_LABELS[role] || role;
}

function paymentLabel(paymentType) {
  if (!paymentType) return '';
  return PAYMENT_LABELS[paymentType] || paymentType;
}

function speciesLabel(species) {
  if (!species) return '—';
  return SPECIES_LABELS[species] || species;
}

/* Хедер */
function Header({ user, onLoginClick, onLogout, productSearch, setProductSearch, cartCount, onCartClick }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-logo">
            <h1 className="header-logo-text">Зоотопия</h1>
          </div>
          <div className="header-search-wrapper">
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="header-search-input"
            />
          </div>
          <div className="header-actions">
                <button type="button" className="cart-btn" onClick={onCartClick}>
              <span className="cart-icon">&#128722;</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button type="button" onClick={user ? onLogout : onLoginClick} className="header-auth-btn">
              <span className="header-auth-text">{user ? 'Выйти' : 'Войти'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* Футер */
function Footer({ setActiveSection }) {
  const links = [
    { label: 'Каталог товаров', section: 'products' },
    { label: 'Рекомендации', section: 'recommendations' },
    { label: 'Профиль питомца', section: 'pets' },
    { label: 'История покупок', section: 'sales' },
  ];
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-section-title">Быстрые ссылки</h3>
            <ul className="footer-links">
              {links.map((l) => (
                <li key={l.section}>
                  <button type="button" className="footer-link" onClick={() => setActiveSection(l.section)}>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="footer-section-title">Связь с нами</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <div className="footer-contact-icon">&#9742;</div>
                <div>
                  <p className="footer-contact-label">Телефон</p>
                  <a href="tel:+76665554433" className="footer-contact-link">+7(666)555-44-33</a>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">&#9993;</div>
                <div>
                  <p className="footer-contact-label">Электронная почта</p>
                  <a href="mailto:zootopia@petshop.ru" className="footer-contact-link">zootopia@petshop.ru</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2026 Зоотопия. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}


function App() {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  /* Формирует полный URL картинки — если путь относительный, добавляет адрес бэкенда */
  const imgUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=400&fit=crop';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* Корзина — хранится в состоянии как массив {product, quantity} */
  const [showCart, setShowCart] = useState(false);
  const [cartPayment, setCartPayment] = useState('card');
  const [cartAddress, setCartAddress] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [cartError, setCartError] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [activeSection, setActiveSection] = useState('products');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [error, setError] = useState('');
  const [trainLoading, setTrainLoading] = useState(false);
  const [trainMessage, setTrainMessage] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  const [editProductError, setEditProductError] = useState('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pets, setPets] = useState([]);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');

  /* Модальное окно редактирования товара */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    article: '',
    price: '',
    quantity: '',
    unit: '',
    image_url: '',
    description: '',
    category_id: '',
    imageFile: null,
  });

  /* Форма редактирования клиента */
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editClientForm, setEditClientForm] = useState({
    email: '',
    full_name: '',
    phone: '',
  });

  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    article: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'шт',
    image_url: '',
    imageFile: null,
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', parent_id: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', parent_id: '' });
  const [sidebarCategoriesOpen, setSidebarCategoriesOpen] = useState(true);
  const [productCategoryFilter, setProductCategoryFilter] = useState(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null); // для показа подкатегорий
  const [petForm, setPetForm] = useState({
    owner_id: '',
    name: '',
    species: 'dog',
    breed: '',
    weight: '',
    body_girth: '',
    back_length: '',
  });
  const [editingPet, setEditingPet] = useState(null);
  const [editPetForm, setEditPetForm] = useState({ name: '', species: 'dog', breed: '', weight: '', body_girth: '', back_length: '' });
  const [saleForm, setSaleForm] = useState({
    client_id: '',
    payment_type: 'card',
    items: [{ product_id: '', quantity: 1 }],
  });

  /* Форма создания сотрудника — только роль seller */
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'seller',
  });

  /* Форма создания клиента */
  const [clientForm, setClientForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });

  const role = user?.role || '';
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller' || isAdmin;
  const isClient = role === 'client' || isAdmin;

  /* Разделы бокового меню — видны всем, но некоторые требуют авторизации */
  const ALL_SECTIONS = [
    { id: 'pets', label: 'Питомцы', roles: ['client', 'admin'] },
    { id: 'recommendations', label: 'Рекомендации', roles: ['client', 'admin'] },
    { id: 'sales', label: 'История покупок', roles: ['client', 'seller', 'admin'] },
    { id: 'clients', label: 'Клиенты', roles: ['seller', 'admin'] },
    { id: 'users', label: 'Сотрудники', roles: ['admin'] },
    { id: 'audit', label: 'Аудит', roles: ['admin'] },
  ];

  /* Все вкладки видны в меню — гость видит их, но при входе получает запрос авторизации */
  const sections = useMemo(() => {
    if (!token) {
      /* Гость видит только публичные вкладки */
      return [
        { id: 'pets', label: 'Питомцы' },
        { id: 'recommendations', label: 'Рекомендации' },
        { id: 'sales', label: 'История покупок' },
      ];
    }
    const items = [];
    if (isClient) {
      items.push({ id: 'pets', label: 'Питомцы' });
      items.push({ id: 'recommendations', label: 'Рекомендации' });
      items.push({ id: 'sales', label: 'История покупок' });
    }
    if (isSeller) {
      if (!items.find((x) => x.id === 'sales')) items.push({ id: 'sales', label: 'История покупок' });
      items.push({ id: 'clients', label: 'Клиенты' });
    }
    if (isAdmin) {
      /* Вкладка переименована: Пользователи -> Сотрудники */
      items.push({ id: 'users', label: 'Сотрудники' });
      items.push({ id: 'audit', label: 'Аудит' });
    }
    return items;
  }, [isAdmin, isClient, isSeller, token]);

  const sectionTitles = {
    products: 'Товары',
    categories: 'Категории',
    pets: 'Питомцы',
    recommendations: 'Рекомендации',
    sales: 'История покупок',
    clients: 'Клиенты',
    /* Переименовано */
    users: 'Сотрудники',
    audit: 'Журнал действий',
    feedback: 'Поддержка и обратная связь',
  };

  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat.name])),
    [categories]
  );
  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        const q = productSearch.toLowerCase();
        const categoryName = (categoryNameById[item.category_id] || '').toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(q) || categoryName.includes(q) || (item.article || '').includes(q);
        if (productCategoryFilter === null) return matchesSearch;
        // Включаем товары из выбранной категории и всех её подкатегорий
        const subIds = new Set(
          categories.filter((c) => c.parent_id === productCategoryFilter).map((c) => c.id)
        );
        subIds.add(productCategoryFilter);
        const matchesCat = subIds.has(Number(item.category_id));
        return matchesSearch && matchesCat;
      }),
    [products, productSearch, productCategoryFilter, categoryNameById, categories]
  );

  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    let body = null;
    try {
      body = await response.json();
    } catch (e) {
      body = null;
    }
    if (!response.ok) {
      throw new Error(body?.detail || body?.message || `Ошибка ${response.status}`);
    }
    return body;
  }

  async function refreshMe() {
    if (!token) return;
    const me = await api('/auth/me');
    setUser(me);
  }

  async function loadSectionData(section) {
    if (section === 'products') {
      setLoading(true);
      setError('');
      try {
        setProducts(await api('/products/'));
        if (categories.length === 0) setCategories(await api('/categories/'));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!token) return;
    setLoading(true);
    setError('');
    try {
      if (section === 'categories') setCategories(await api('/categories/'));
      if (section === 'pets') setPets(await api(isAdmin ? '/pets/' : '/pets/my'));
      if (section === 'sales') {
        setProducts(await api('/products/'));
        setSales(await api(isSeller ? '/sales/' : '/sales/my'));
      }
      if (section === 'clients') {
        try { setClients(await api('/clients/')); } catch { setClients([]); }
      }
      if (section === 'users') setUsers(await api('/users/'));
      if (section === 'recommendations') {
        setProducts(await api('/products/'));
        setRecommendations(await api('/recommendations/my'));
      }
      if (section === 'audit') setAuditLogs(await api('/audit/all'));
      if (section === 'feedback' && isAdmin) {
        const fb = await api('/feedback/');
        setFeedbacks(Array.isArray(fb) ? fb : []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch { }
  }, [cart]);

  useEffect(() => {
    refreshMe().catch(() => {
      // Токен устарел или невалиден — тихо разлогиниваем без показа ошибки
      handleLogout();
    });
  }, [token]);

  /* Загружаем категории для сайдбара */
  useEffect(() => {
    (async () => {
      try {
        const cats = await api('/categories/');
        setCategories(cats);
      } catch (e) {
      }
    })();

  }, []);

  useEffect(() => {
    loadSectionData(activeSection);
  }, [activeSection, token, user?.role]);

  const goToSection = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setAuthMessage('');
    if (authMode === 'register') {
      if (!authForm.password || authForm.password.trim().length === 0) {
        setError('Пароль не может быть пустым');
        return;
      }
      if (authForm.password.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        return;
      }
    }
    try {
      if (authMode === 'login') {
        const data = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: authForm.email, password: authForm.password }),
        });
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setShowAuthModal(false);
        setAuthMessage('Вход выполнен');
      } else {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify(authForm),
        });
        setAuthMessage('Регистрация успешна, теперь войдите');
        setAuthMode('login');
      }
    } catch (e2) {
      setError(e2.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setProducts([]);
    setCategories([]);
    setPets([]);
    setSales([]);
    setClients([]);
    setUsers([]);
    setRecommendations([]);
    setAuditLogs([]);
    setActiveSection('products');
  };

  /* Генерация уникального 7-значного артикула */
  const generateArticle = () => {
    const existing = new Set(products.map((p) => p.article).filter(Boolean));
    let article;
    do {
      article = String(Math.floor(1000000 + Math.random() * 9000000));
    } while (existing.has(article));
    return article;
  };

  /* Валидация телефона */
  const validatePhone = (phone) => {
    if (!phone) return true;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 12;
  };

  const formatPhoneInput = (value, prevValue) => {
    const digits = value.replace(/\D/g, '');
    const prevDigits = (prevValue || '').replace(/\D/g, '');
    // Если стёрли разделитель (длина строки уменьшилась, но цифр столько же) — убираем последнюю цифру
    const isDeleting = prevValue !== undefined && value.length < prevValue.length;
    const finalDigits = isDeleting && digits.length >= prevDigits.length
      ? digits.slice(0, -1)
      : digits;
    if (finalDigits.length === 0) return '';
    const d = finalDigits.startsWith('8') ? '7' + finalDigits.slice(1)
      : finalDigits.startsWith('7') ? finalDigits : '7' + finalDigits;
    let r = '+' + d[0];
    if (d.length > 1) r += '(' + d.slice(1, 4);
    if (d.length >= 4) r += ')' + d.slice(4, 7);
    if (d.length >= 7) r += '-' + d.slice(7, 9);
    if (d.length >= 9) r += '-' + d.slice(9, 11);
    return r;
  };

  const phoneKeyDown = (e, currentValue, setter, formKey, form) => {
    if (e.key === 'Backspace') {
      const digits = currentValue.replace(/\D/g, '');
      if (digits.length <= 1) {
        e.preventDefault();
        setter({ ...form, [formKey]: '' });
      }
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const article = productForm.article || generateArticle();
      await api('/products/', {
        method: 'POST',
        body: JSON.stringify({
          ...productForm,
          article,
          category_id: Number(productForm.category_id),
          price: Number(productForm.price),
          quantity: Number(productForm.quantity || 0),
        }),
      });
      setMessage('Товар создан');
      setProductForm({
        category_id: '',
        name: '',
        article: '',
        description: '',
        price: '',
        quantity: '',
        unit: 'шт',
        image_url: '',
      });
      loadSectionData('products');
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Загрузка картинки товара из файлов */
  const uploadImage = async (file, productId) => {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/products/${productId}/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Ошибка загрузки картинки');
    const data = await res.json();
    /* Формируем полный URL с адресом бэкенда */
    return { ...data, image_url: `${API_BASE}${data.image_url}` };
  };

  /* Создать товар и сразу загрузить картинку если выбрана */
  const saveProductWithImage = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { imageFile, ...formData } = productForm;
      const article = formData.article || generateArticle();
      const created = await api('/products/', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          article,
          category_id: Number(formData.category_id),
          price: Number(formData.price),
          quantity: Number(formData.quantity || 0),
        }),
      });
      if (imageFile) {
        await uploadImage(imageFile, created.id);
      }
      setMessage('Товар создан');
      setProductForm({ category_id: '', name: '', article: '', description: '', price: '', quantity: '', unit: 'шт', image_url: '', imageFile: null });
      loadSectionData('products');
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Обновить товар и загрузить новую картинку если выбрана */
  const updateProductWithImage = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { imageFile, ...formData } = editForm;
      await api(`/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          category_id: Number(formData.category_id),
          price: Number(formData.price),
          quantity: Number(formData.quantity || 0),
        }),
      });
      if (imageFile) {
        await uploadImage(imageFile, editingProduct.id);
      }
      setMessage('Товар обновлён');
      closeEditModal();
      loadSectionData('products');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      setMessage('Товар удален');
      loadSectionData('products');
    } catch (e) {
      setError(e.message);
    }
  };

  const openProductDetails = (product) => setSelectedProduct(product);
  const closeProductDetails = () => setSelectedProduct(null);

  /* Открыть модальное окно редактирования товара */
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      article: product.article || '',
      price: product.price,
      quantity: product.quantity || '',
      unit: product.unit || '',
      image_url: product.image_url || '',
      description: product.description || '',
      category_id: product.category_id || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditForm({
      name: '',
      article: '',
      price: '',
      quantity: '',
      unit: '',
      image_url: '',
      description: '',
      category_id: ''
    });
  };

  /* Сохранить изменения товара */
  const updateProduct = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(`/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editForm,
          category_id: Number(editForm.category_id),
          price: Number(editForm.price),
          quantity: Number(editForm.quantity || 0),
        }),
      });
      setMessage('Товар обновлён');
      closeEditModal();
      loadSectionData('products');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      await api('/categories/', {
        method: 'POST',
        body: JSON.stringify({
          name: categoryForm.name,
          parent_id: categoryForm.parent_id ? Number(categoryForm.parent_id) : null,
        }),
      });
      setMessage('Категория создана');
      setCategoryForm({ name: '', parent_id: '' });
      loadSectionData('categories');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Удалить категорию? Это может затронуть товары в ней.')) return;
    try {
      await api(`/categories/${id}`, { method: 'DELETE' });
      setMessage('Категория удалена');
      loadSectionData('categories');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryForm({ name: cat.name, parent_id: cat.parent_id || '' });
  };

  const closeEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryForm({ name: '', parent_id: '' });
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    try {
      await api(`/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editCategoryForm.name,
          parent_id: editCategoryForm.parent_id ? Number(editCategoryForm.parent_id) : null,
        }),
      });
      setMessage('Категория обновлена');
      closeEditCategory();
      loadSectionData('categories');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const savePet = async (e) => {
    e.preventDefault();
    try {
      await api('/pets/', {
        method: 'POST',
        body: JSON.stringify({
          ...petForm,
          owner_id: petForm.owner_id ? Number(petForm.owner_id) : undefined,
          weight: petForm.weight ? Number(petForm.weight) : null,
          body_girth: petForm.body_girth ? Number(petForm.body_girth) : null,
          back_length: petForm.back_length ? Number(petForm.back_length) : null,
        }),
      });
      setMessage('Питомец добавлен');
      setPetForm({
        owner_id: '',
        name: '',
        species: 'dog',
        breed: '',
        weight: '',
        body_girth: '',
        back_length: '',
      });
      loadSectionData('pets');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const openEditPet = (pet) => {
    setEditingPet(pet);
    setEditPetForm({
      name: pet.name,
      species: pet.species || 'dog',
      breed: pet.breed || '',
      weight: pet.weight || '',
      body_girth: pet.body_girth || '',
      back_length: pet.back_length || '',
    });
  };

  const closeEditPet = () => {
    setEditingPet(null);
    setEditPetForm({ name: '', species: 'dog', breed: '', weight: '', body_girth: '', back_length: '' });
  };

  const updatePet = async (e) => {
    e.preventDefault();
    try {
      await api(`/pets/${editingPet.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editPetForm,
          weight: editPetForm.weight ? Number(editPetForm.weight) : null,
          body_girth: editPetForm.body_girth ? Number(editPetForm.body_girth) : null,
          back_length: editPetForm.back_length ? Number(editPetForm.back_length) : null,
        }),
      });
      setMessage('Питомец обновлён');
      closeEditPet();
      loadSectionData('pets');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const deletePet = async (id) => {
    if (!window.confirm('Удалить питомца?')) return;
    try {
      await api(`/pets/${id}`, { method: 'DELETE' });
      setMessage('Питомец удалён');
      loadSectionData('pets');
    } catch (e2) {
      setError(e2.message);
    }
  };

  const createSale = async (e) => {
    e.preventDefault();
    try {
      const items = saleForm.items
        .filter((i) => i.product_id)
        .map((i) => {
          const id = i._resolved_id || products.find((p) => p.article === i.product_id)?.id || Number(i.product_id);
          return { product_id: id, quantity: Number(i.quantity) };
        });

      if (items.length === 0) { setError('Добавьте хотя бы один товар'); return; }
      if (items.some((i) => !i.product_id)) { setError('Один или несколько артикулов не найдены'); return; }

      await api('/sales/', {
        method: 'POST',
        body: JSON.stringify({
          client_id: saleForm.client_id ? Number(saleForm.client_id) : null,
          payment_type: saleForm.payment_type,
          items,
        }),
      });
      setMessage('Продажа создана');
      setSaleForm({ client_id: '', payment_type: 'card', items: [{ product_id: '', quantity: 1 }] });
      loadSectionData('sales');
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Создать сотрудника — только роль seller */
  const saveUser = async (e) => {
    e.preventDefault();
    if (userForm.phone && !validatePhone(userForm.phone)) {
      setError('Номер телефона должен содержать от 10 до 12 цифр');
      return;
    }
    try {
      await api('/users/', { method: 'POST', body: JSON.stringify(userForm) });
      setMessage('Сотрудник создан');
      setUserForm({ email: '', password: '', full_name: '', phone: '', role: 'seller' });
      loadSectionData('users');
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Создать клиента */
  const saveClient = async (e) => {
    e.preventDefault();
    if (clientForm.phone && !validatePhone(clientForm.phone)) {
      setError('Номер телефона должен содержать от 10 до 12 цифр');
      return;
    }
    try {
      await api('/clients/', {
        method: 'POST',
        body: JSON.stringify({ ...clientForm }),
      });
      setMessage('Клиент создан');
      setClientForm({ email: '', password: '', full_name: '', phone: '' });
      loadSectionData('clients');
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Открыть форму редактирования клиента */
  const openEditClient = (client) => {
    setEditingClient(client);
    setEditClientForm({ email: client.email, full_name: client.full_name, phone: client.phone || '' });
    setIsEditClientOpen(true);
  };

  const closeEditClient = () => {
    setIsEditClientOpen(false);
    setEditingClient(null);
    setEditClientForm({ email: '', full_name: '', phone: '' });
  };

  /* Сохранить изменения клиента */
  const updateClient = async (e) => {
    e.preventDefault();
    try {
      await api(`/clients/${editingClient.id}`, {
        method: 'PUT',
        body: JSON.stringify(editClientForm),
      });
      setMessage('Данные клиента обновлены');
      closeEditClient();
      loadSectionData('clients');
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Отправить обращение в поддержку */
  const saveFeedback = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/feedback/', {
        method: 'POST',
        body: JSON.stringify(feedbackForm),
      });
      setMessage('Обращение отправлено! Мы свяжемся с вами в ближайшее время.');
      setFeedbackForm({ name: '', email: '', subject: '', message: '' });
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Изменить статус обращения — только для администратора */
  const updateFeedbackStatus = async (id, status) => {
    try {
      await api(`/feedback/${id}/status?status=${status}`, { method: 'PUT' });
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status } : f));
    } catch (e) {
      setError(e.message);
    }
  };

  const blockClient = async (id) => {
    try {
      await api(`/clients/${id}/block`, { method: 'PUT' });
      setMessage('Клиент заблокирован');
      loadSectionData('clients');
    } catch (e) {
      setError(e.message);
    }
  };

  const unblockClient = async (id) => {
    try {
      await api(`/clients/${id}/unblock`, { method: 'PUT' });
      setMessage('Клиент разблокирован');
      loadSectionData('clients');
    } catch (e) {
      setError(e.message);
    }
  };

  const blockUser = async (id) => {
    try {
      await api(`/users/${id}/block`, { method: 'PUT' });
      setMessage('Сотрудник заблокирован');
      loadSectionData('users');
    } catch (e) {
      setError(e.message);
    }
  };

  const unblockUser = async (id) => {
    try {
      await api(`/users/${id}/unblock`, { method: 'PUT' });
      setMessage('Сотрудник разблокирован');
      loadSectionData('users');
    } catch (e) {
      setError(e.message);
    }
  };

  const generateRecommendations = async () => {
    setGenLoading(true);
    setGenMessage('');
    try {
      const result = await api('/recommendations/generate', { method: 'POST' });
      setGenMessage(result.message || 'Рекомендации успешно сгенерированы');
      loadSectionData('recommendations');
    } catch (e) {
      setGenMessage('Ошибка: ' + e.message);
    } finally {
      setGenLoading(false);
    }
  };

  const trainRecommendations = async () => {
    setTrainLoading(true);
    setTrainMessage('');
    try {
      const result = await api('/recommendations/train', { method: 'POST' });
      setTrainMessage(result.message || 'Модель успешно обучена');
    } catch (e) {
      setTrainMessage('Ошибка: ' + e.message);
    } finally {
      setTrainLoading(false);
    }
  };

  /* Добавить товар в корзину */
  const addToCart = (product) => {
    if (!token) { setShowAuthModal(true); return; }
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          setCartError(`Максимальное количество «${product.name}» на складе: ${product.quantity} шт.`);
          return prev;
        }
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      if (product.quantity < 1) {
        setCartError(`Товар «${product.name}» закончился на складе`);
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  /* Убрать товар из корзины */
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  /* Изменить количество в корзине */
  const changeCartQty = (productId, qty) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((i) => {
      if (i.product.id !== productId) return i;
      if (qty > i.product.quantity) {
        setCartError(`Максимальное количество «${i.product.name}» на складе: ${i.product.quantity} шт.`);
        return i;
      }
      return { ...i, quantity: qty };
    }));
  };

  /* Оформить заказ из корзины */
  const checkoutCart = async () => {
    if (cart.length === 0) return;
    if (!cartAddress.trim()) { setCartError('Укажите адрес доставки'); return; }
    if (user && !user.is_active) {
      setCartError('Ваш аккаунт заблокирован. Оформление заказа невозможно. Обратитесь к администратору.');
      return;
    }
    setCartError('');
    try {
      const items = cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity }));
      await api('/sales/', {
        method: 'POST',
        body: JSON.stringify({ payment_type: cartPayment, items }),
      });
      setCart([]);
      setShowCart(false);
      setCartAddress('');
      setShowOrderSuccess(true);
    } catch (e) {
      setCartError(e.message);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const formatMoney = (value) => Number(value).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });

  const goToProducts = (categoryId) => {
    setProductCategoryFilter(categoryId);
    setActiveSection('products');
  };

  /* Закрывает модалку только при клике на overlay, но не при выделении текста */
  const overlayProps = (onClose) => ({
    onMouseDown: (e) => { if (e.target === e.currentTarget) e.currentTarget._sc = true; },
    onMouseUp: (e) => {
      if (e.currentTarget._sc && e.target === e.currentTarget) onClose();
      e.currentTarget._sc = false;
    },
  });

  /* --------- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ------------- */

  const authModalContent = (
    <div className="modal-overlay" {...overlayProps(() => setShowAuthModal(false))}>
      <div className="modal-card auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <h3>{authMode === 'login' ? 'Вход в систему' : 'Регистрация'}</h3>
          <button onClick={() => setShowAuthModal(false)}>X</button>
        </div>
        <form className="auth-form" onSubmit={handleAuthSubmit}>
          <label htmlFor="m-email">Email</label>
          <input id="m-email" placeholder="example@email.com" type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
          <label htmlFor="m-password">Пароль</label>
          <div className="password-wrap">
            <input id="m-password" placeholder="Минимум 6 символов"
              type={showPassword ? 'text' : 'password'}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required />
            <button type="button" className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? 'скрыть' : 'показать'}
            </button>
          </div>
          {authMode === 'register' && (
            <>
              <label htmlFor="m-full_name">Имя Фамилия</label>
              <input id="m-full_name" placeholder="Иван Иванов"
                value={authForm.full_name}
                onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })} required />
              <label htmlFor="m-phone">Телефон</label>
              <input id="m-phone" placeholder="+7(999)999-99-99"
                value={authForm.phone}
                onChange={(e) => setAuthForm({ ...authForm, phone: formatPhoneInput(e.target.value, authForm.phone) })}
                onKeyDown={(e) => phoneKeyDown(e, authForm.phone, setAuthForm, 'phone', authForm)} />
            </>
          )}
          <button type="submit" className="primary auth-submit">
            {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <button className="link-btn"
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
          {authMode === 'login' ? 'Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
        {error && <p className="error-text auth-notice">{error}</p>}
        {message && <p className="success-text auth-notice">{message}</p>}
      </div>
    </div>
  );

  /* --------- БОКОВАЯ ПАНЕЛЬ УПРАВЛЕНИЯ ------------- */

  return (
    <div className="layout-wrapper">
      <Header
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        productSearch={productSearch}
        setProductSearch={setProductSearch}
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
      />
      <div className="layout">
      {showAuthModal && authModalContent}

      <aside className="sidebar">
        {user ? (
          <div className="user-chip">
            <p className="user-name">{user?.full_name}</p>
            <p className="user-role">{roleLabel(user?.role)}</p>
          </div>
        ) : (
          <button
            type="button"
            className="primary login-sidebar-btn"
            onClick={() => setShowAuthModal(true)}
          >
            Войти / Зарегистрироваться
          </button>
        )}

        <nav className="menu">
          <button
            type="button"
            className={activeSection === 'products' ? 'menu-item active' : 'menu-item'}
            onClick={() => {
              setProductCategoryFilter(null);
              setActiveSection('products');
            }}
          >
            <span>Товары</span>
          </button>

          <div className="sidebar-dropdown">
            <button
              type="button"
              className="menu-item sidebar-dropdown-toggle"
              onClick={() => setSidebarCategoriesOpen((v) => !v)}
            >
              <span className="sidebar-dropdown-label">Категории</span>
              <span className="sidebar-dropdown-chevron">{sidebarCategoriesOpen ? 'v' : '>'}</span>
            </button>
            {sidebarCategoriesOpen && (
              <div className="sidebar-dropdown-list">
                <button
                  type="button"
                  className={
                    activeSection === 'products' && productCategoryFilter === null
                      ? 'sidebar-subitem active'
                      : 'sidebar-subitem'
                  }
                  onClick={() => goToProducts(null)}
                >
                  Все товары
                </button>
                {categories.filter((c) => c.parent_id == null).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      activeSection === 'products' && productCategoryFilter === c.id
                        ? 'sidebar-subitem active'
                        : 'sidebar-subitem'
                    }
                    onClick={() => goToProducts(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    type="button"
                    className="sidebar-subitem sidebar-subitem-admin"
                    onClick={() => setActiveSection('categories')}
                  >
                    Управление категориями
                  </button>
                )}
              </div>
            )}
          </div>

            {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? 'menu-item active' : 'menu-item'}
              onClick={() => goToSection(section.id)}
            >
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        {user && (
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        )}
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>{sectionTitles[activeSection] || 'Панель'}</h1>
        </header>
        {loading && <p className="muted app-notice">Загрузка...</p>}
        {error && <p className="error-text app-notice">{error}</p>}

          {!token && activeSection !== 'products' && activeSection !== 'categories' && (
          <div className="auth-required-block">
            <h3>Требуется вход в аккаунт</h3>
            <p>Этот раздел доступен только зарегистрированным пользователям.</p>
            <button
              type="button"
              className="primary"
              onClick={() => setShowAuthModal(true)}
            >
              Войти / Зарегистрироваться
            </button>
          </div>
        )}

        {activeSection === 'products' && (
          <section className="card section-card">
            {/* Фильтр по категориям */}
            <div className="category-filter">
              <button
                type="button"
                className={productCategoryFilter === null ? 'category-chip active' : 'category-chip'}
                onClick={() => { setProductCategoryFilter(null); setSelectedParentCategory(null); }}
              >
                Все
              </button>
              {categories.filter((c) => c.parent_id == null).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={productCategoryFilter === c.id ? 'category-chip active' : 'category-chip'}
                  onClick={() => { setProductCategoryFilter(c.id); setSelectedParentCategory(null); }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/*---------ДОБАВЛЕНИЕ ТОВАРА ------------- */}

            {isAdmin && (
              <form className="form-grid" onSubmit={saveProductWithImage}>
                <h3 className="section-form-title">Добавить товар</h3>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.filter((c) => c.parent_id == null).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input placeholder="Название" value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                <input placeholder="Цена" type="number" step="0.01" min="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                <input placeholder="Кол-во" type="number" min="0"
                  value={productForm.quantity}
                  onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
                <input placeholder="Ед. изм" value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
                <div>
                  <label style={{fontSize:13,color:'#496580',display:'block',marginBottom:4}}>Картинка</label>
                  <label className="file-upload-btn">
                    Выбрать файл
                    <input type="file" accept="image/*" style={{display:'none'}}
                      onChange={(e) => setProductForm({ ...productForm, imageFile: e.target.files[0] || null })} />
                  </label>
                  {productForm.imageFile && (
                    <span className="file-upload-name">{productForm.imageFile.name}</span>
                  )}
                  <input placeholder="Или вставьте URL картинки" value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    style={{marginTop:6}} />
                </div>
                <textarea placeholder="Описание" value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                <button type="submit" className="primary">Сохранить</button>
              </form>
            )}

            <div className="product-grid">
              {filteredProducts.map((item) => (
                <article key={item.id} className="product-card">
                  <div className="product-thumb">
                    <img
                      src={imgUrl(item.image_url)}
                      alt={item.name}
                    />
                  </div>
                  <div className="product-body">
                    <h3>{item.name}</h3>
                    <div className="product-meta">
                      <span className="product-price">{formatMoney(item.price)}</span>
                    </div>
                    <div className="product-actions">
                      <button className="primary" onClick={() => openProductDetails(item)}>Подробнее</button>
                                {!isAdmin && !isSeller && (
                        <button className="cart-add-btn" onClick={() => addToCart(item)}>В корзину</button>
                      )}
                      {isAdmin && (
                        <button className="ghost-btn" onClick={() => openEditModal(item)}>Изменить</button>
                      )}
                      {isAdmin && <button onClick={() => removeProduct(item.id)}>Удалить</button>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredProducts.length === 0 && <p className="muted">Товары не найдены</p>}
          </section>
        )}

        {activeSection === 'categories' && isAdmin && (
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Управление категориями</h3>
            </div>
            <form className="inline-form" onSubmit={saveCategory}>
              <input
                placeholder="Название категории"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
              <button className="primary" type="submit">Добавить</button>
            </form>
            <ul className="category-admin-list">
              {categories.filter((c) => c.parent_id == null).map((c) => (
                <li key={c.id} className="category-admin-row">
                  <span className="category-admin-name">{c.name}</span>
                  {c.parent_id != null && (
                    <span className="muted">вложена в: {categoryNameById[c.parent_id] || 'категория'}</span>
                  )}
                  <div className="category-admin-actions">
                    <button className="ghost-btn" onClick={() => openEditCategory(c)}>Изменить</button>
                    <button onClick={() => deleteCategory(c.id)}>Удалить</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* -------- ПИТОМЦЫ ------------- */}

        {activeSection === 'pets' && (
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Профиль питомцев</h3>
            </div>
            <form className="form-grid" onSubmit={savePet}>
              <h3 className="section-form-title">Добавить питомца</h3>
              {isAdmin && (
                <input
                  placeholder="ID владельца"
                  value={petForm.owner_id}
                  onChange={(e) => setPetForm({ ...petForm, owner_id: e.target.value })}
                />
              )}
              <input placeholder="Кличка" value={petForm.name}
                onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required />
              <select value={petForm.species}
                onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}>
                <option value="dog">Собака</option>
                <option value="cat">Кошка</option>
                <option value="bird">Птица</option>
                <option value="fish">Рыба</option>
                <option value="rodent">Грызун</option>
                <option value="other">Другое</option>
              </select>
              <input placeholder="Порода" value={petForm.breed}
                onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} />
              <input placeholder="Вес, кг" value={petForm.weight}
                onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} />
              <input placeholder="Обхват, см" value={petForm.body_girth}
                onChange={(e) => setPetForm({ ...petForm, body_girth: e.target.value })} />
              <input placeholder="Длина спины, см" value={petForm.back_length}
                onChange={(e) => setPetForm({ ...petForm, back_length: e.target.value })} />
              <button type="submit" className="primary">Сохранить</button>
            </form>
            <table className="data-table">
              <thead>
                <tr>
                  {isAdmin && <th>ID клиента</th>}
                  <th>Кличка</th>
                  <th>Вид</th>
                  <th>Порода</th>
                  <th>Вес, кг</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pets.map((p) => (
                  <tr key={p.id}>
                    {isAdmin && <td className="muted">{p.owner_id}</td>}
                    <td>{p.name}</td>
                    <td>{speciesLabel(p.species)}</td>
                    <td>{p.breed || '—'}</td>
                    <td>{p.weight || '—'}</td>
                    <td className="table-actions">
                      <button type="button" className="ghost-btn" onClick={() => openEditPet(p)}>Изменить</button>
                      <button type="button" onClick={() => deletePet(p.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* --------- ИСТОРИЯ ПОКУПОК ------------- */}

        {activeSection === 'sales' && (
          <section className="card section-card">
            {isSeller && (
              <form className="form-grid" onSubmit={createSale}>
                <h3 className="section-form-title">Оформить продажу</h3>
                <input
                  placeholder="ID клиента (необязательно)"
                  type="number"
                  min="1"
                  value={saleForm.client_id}
                  onChange={(e) => setSaleForm({ ...saleForm, client_id: e.target.value })}
                  style={{ gridColumn: '1 / -1' }}
                />
                <select
                  value={saleForm.payment_type}
                  onChange={(e) => setSaleForm({ ...saleForm, payment_type: e.target.value })}
                  style={{ gridColumn: '1 / -1' }}
                >
                  <option value="card">Банковская карта</option>
                  <option value="cash">Наличные при получении</option>
                </select>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {saleForm.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        placeholder="Артикул товара (7 цифр)"
                        value={item.product_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = products.find((p) => p.article === val);
                          const updated = [...saleForm.items];
                          updated[idx] = { ...updated[idx], product_id: val, _resolved_id: found ? found.id : null, _name: found ? found.name : null };
                          setSaleForm({ ...saleForm, items: updated });
                        }}
                        style={{ flex: 2 }}
                        required
                      />
                      {item._name && <span style={{ fontSize: 12, color: '#496580' }}>{item._name}</span>}
                      <input
                        placeholder="Количество"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...saleForm.items];
                          updated[idx] = { ...updated[idx], quantity: e.target.value };
                          setSaleForm({ ...saleForm, items: updated });
                        }}
                        style={{ flex: 1 }}
                        required
                      />
                      {saleForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSaleForm({ ...saleForm, items: saleForm.items.filter((_, i) => i !== idx) })}
                          style={{ flexShrink: 0 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setSaleForm({ ...saleForm, items: [...saleForm.items, { product_id: '', quantity: 1 }] })}
                  >
                    + Добавить товар
                  </button>
                </div>

                <button className="primary" type="submit" style={{ gridColumn: '1 / -1' }}>Создать продажу</button>
              </form>
            )}
            {role === 'client' && (
              <div className="client-cart-hint">
                <p className="muted">Чтобы оформить заказ — добавьте товары в корзину и нажмите «Оформить заказ».</p>
                <button className="primary" onClick={() => setShowCart(true)}>Открыть корзину</button>
              </div>
            )}
            <div className="purchase-list">
              {sales.length === 0 && <p className="muted">Пока нет покупок</p>}
              {[...sales].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((sale) => (
                <div key={sale.id} className="purchase-block">
                  <div className="purchase-header">
                    <span>{new Date(sale.created_at).toLocaleString('ru-RU')}</span>
                    <span className="purchase-total">{formatMoney(sale.total_amount)}</span>
                    <span className="purchase-pay">{paymentLabel(sale.payment_type)}</span>
                  </div>
                  <div className="product-grid product-grid-tight">
                    {(sale.items || []).map((line) => {
                      const p = productById[line.product_id];
                      return (
                        <article key={`${sale.id}-${line.id}`} className="product-card product-card-compact">
                          <div className="product-thumb">
                            <img
                              src={imgUrl(p?.image_url)}
                              alt={p?.name || 'Товар'}
                            />
                          </div>
                          <div className="product-body">
                            <h3>{p?.name || 'Товар удалён или недоступен'}</h3>
                            <div className="product-meta">
                              <span className="muted">Количество: {line.quantity}</span>
                              <span className="product-price">{formatMoney(line.subtotal)}</span>
                            </div>
                            {p && (
                              <button type="button" className="primary" onClick={() => openProductDetails(p)}>
                                Подробнее
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/*---------КЛИЕНТЫ ------------- */}

        {activeSection === 'clients' && (
          <section className="card section-card">
            {/* Форма создания клиента */}
            <form className="form-grid" onSubmit={saveClient}>
              <h3 className="section-form-title">Добавить клиента</h3>
              <input placeholder="Email" type="email" value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} required />
              <input placeholder="Пароль" type="password" value={clientForm.password}
                onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })} required />
              <input placeholder="Имя Фамилия" value={clientForm.full_name}
                onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })} required />
              <input placeholder="+7(999)999-99-99" value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: formatPhoneInput(e.target.value, clientForm.phone) })}
                onKeyDown={(e) => phoneKeyDown(e, clientForm.phone, setClientForm, 'phone', clientForm)} />
              <button className="primary" type="submit">Создать</button>
            </form>

            <input
              placeholder="Поиск по имени или email клиента..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              style={{ marginBottom: 12, width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #C8DCF0', fontSize: 14, boxSizing: 'border-box' }}
            />
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ФИО</th>
                  <th>Email</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {clients.filter(c =>
                  c.full_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                  c.email?.toLowerCase().includes(clientSearch.toLowerCase())
                ).map((c) => (
                  <tr key={c.id}>
                    <td className="muted">{c.id}</td>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.is_active ? 'Активен' : 'Заблокирован'}</td>
                    <td className="table-actions">
                      <button type="button" className="ghost-btn" onClick={() => openEditClient(c)}>
                        Изменить
                      </button>
                      {isSeller && (
                        c.is_active ? (
                          <button type="button" onClick={() => blockClient(c.id)}>Заблокировать</button>
                        ) : (
                          <button type="button" onClick={() => unblockClient(c.id)}>Разблокировать</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/*---------СОТРУДНИКИ ------------- */}

        {activeSection === 'users' && isAdmin && (
          <section className="card section-card">
            <form className="form-grid" onSubmit={saveUser}>
              <h3 className="section-form-title">Создать сотрудника</h3>
              <input placeholder="Email" type="email" value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <input placeholder="Пароль" type="password" value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
              <input placeholder="ФИО" value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} required />
              <input placeholder="+7(999)999-99-99" value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: formatPhoneInput(e.target.value, userForm.phone) })}
                onKeyDown={(e) => phoneKeyDown(e, userForm.phone, setUserForm, 'phone', userForm)} />
              <select value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="seller">Продавец</option>
              </select>
              <button className="primary" type="submit">Создать</button>
            </form>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Имя Фамилия</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.filter((u) => u.role === 'seller').map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{roleLabel(u.role)}</td>
                    <td>{u.is_active ? 'Активен' : 'Заблокирован'}</td>
                    <td>
                      {u.is_active ? (
                        <button type="button" onClick={() => blockUser(u.id)}>Заблокировать</button>
                      ) : (
                        <button type="button" onClick={() => unblockUser(u.id)}>Разблокировать</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/*---------РЕКОМЕНДАЦИИ ------------- */}

        {activeSection === 'recommendations' && (
          <section className="card section-card">
            <div className="actions">
              {role === 'client' && (
                <div>
                  <button
                    type="button"
                    className="primary"
                    onClick={generateRecommendations}
                    disabled={genLoading}
                    style={{ opacity: genLoading ? 0.7 : 1 }}
                  >
                    {genLoading ? 'Генерация...' : 'Сгенерировать рекомендации'}
                  </button>
                  {genMessage && (
                    <p style={{
                      marginTop: 8,
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      backgroundColor: genMessage.startsWith('Ошибка') ? '#fdecea' : '#e6f4ea',
                      color: genMessage.startsWith('Ошибка') ? '#c0392b' : '#1a6b2a',
                      border: genMessage.startsWith('Ошибка') ? '1px solid #f5c6cb' : '1px solid #a8d8a8',
                    }}>
                      {genMessage}
                    </p>
                  )}
                </div>
              )}
              {isAdmin && (
                <button
                  type="button"
                  className="primary"
                  onClick={trainRecommendations}
                  disabled={trainLoading}
                  style={{ opacity: trainLoading ? 0.7 : 1 }}
                >
                  {trainLoading ? 'Обучение...' : 'Обучить модель'}
                </button>
              )}
            </div>
            {isAdmin && (
              <div style={{marginBottom: 12}}>
                <p className="muted">
                  Рекомендации генерируются для клиентов на основе их питомцев и истории покупок.
                  Для работы модуля нажмите «Обучить модель», затем попросите клиента нажать «Сгенерировать рекомендации» в своём кабинете.
                </p>
                {trainMessage && (
                  <p style={{
                    marginTop: 8,
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    backgroundColor: trainMessage.startsWith('Ошибка') ? '#fdecea' : '#e6f4ea',
                    color: trainMessage.startsWith('Ошибка') ? '#c0392b' : '#1a6b2a',
                    border: trainMessage.startsWith('Ошибка') ? '1px solid #f5c6cb' : '1px solid #a8d8a8',
                  }}>
                    {trainMessage}
                  </p>
                )}
              </div>
            )}
            <div className="product-grid">
              {recommendations.length === 0 && <p className="muted">Рекомендаций пока нет</p>}
              {recommendations.map((r) => {
                const p = productById[r.product_id];
                if (!p) {
                  return (
                    <article key={r.id} className="product-card product-card-fallback">
                      <div className="product-body">
                        <h3>Товар недоступен в каталоге</h3>
                        {r.reason && <p className="rec-reason">{r.reason}</p>}
                      </div>
                    </article>
                  );
                }
                return (
                  <article key={r.id} className="product-card">
                    <div className="product-thumb">
                      <img
                        src={imgUrl(p.image_url)}
                        alt={p.name}
                      />
                    </div>
                    <div className="product-body">
                      <h3>{p.name}</h3>
                      <p className="muted">{categoryNameById[p.category_id] || ''}</p>
                      {r.reason && <p className="rec-reason">{r.reason}</p>}
                      <div className="product-meta">
                        <span className="product-price">{formatMoney(p.price)}</span>
                      </div>
                      <div className="product-actions">
                        <button type="button" className="primary" onClick={() => openProductDetails(p)}>
                          Подробнее
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/*---------ПОДДЕРЖКА И ОБРАТНАЯ СВЯЗЬ ------------- */}

        {activeSection === 'feedback' && (
          <section className="card section-card">
            <div className="feedback-layout">

              {/* Форма обратной связи — для всех пользователей */}
              <div className="feedback-form-block">
                <h3 className="section-title">Напишите нам</h3>
                <p className="feedback-desc">
                  Есть вопрос или предложение? Заполните форму и мы ответим вам в ближайшее время.
                </p>
                <form onSubmit={saveFeedback} className="feedback-form">
                  <div className="feedback-row">
                    <div>
                      <label className="feedback-label">Ваше имя</label>
                      <input
                        placeholder="Иван Иванов"
                        value={feedbackForm.name}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="feedback-label">Email</label>
                      <input
                        type="email"
                        placeholder="example@mail.ru"
                        value={feedbackForm.email}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <label className="feedback-label">Тема обращения</label>
                  <select
                    value={feedbackForm.subject}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                    required
                  >
                    <option value="">Выберите тему</option>
                    <option value="Вопрос о товаре">Вопрос о товаре</option>
                    <option value="Проблема с заказом">Проблема с заказом</option>
                    <option value="Вопрос об оплате">Вопрос об оплате</option>
                    <option value="Предложение">Предложение</option>
                    <option value="Другое">Другое</option>
                  </select>
                  <label className="feedback-label">Сообщение</label>
                  <textarea
                    placeholder="Опишите ваш вопрос подробнее..."
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    rows={5}
                    required
                  />
                  <button type="submit" className="primary feedback-submit">
                    Отправить обращение
                  </button>
                </form>
              </div>

              {/* Контактная информация */}
              <div className="feedback-contacts">
                <h3 className="section-title">Контакты</h3>
                <div className="feedback-contact-list">
                  <div className="feedback-contact-card">
                    <div className="feedback-contact-icon">&#9742;</div>
                    <div>
                      <p className="feedback-contact-title">Телефон</p>
                      <a href="tel:+76665554433" className="feedback-contact-value">+7(666)555-44-33</a>
                      <p className="feedback-contact-note">Пн-Пт с 9:00 до 18:00</p>
                    </div>
                  </div>
                  <div className="feedback-contact-card">
                    <div className="feedback-contact-icon">&#9993;</div>
                    <div>
                      <p className="feedback-contact-title">Email</p>
                      <a href="mailto:zootopia@petshop.ru" className="feedback-contact-value">zootopia@petshop.ru</a>
                      <p className="feedback-contact-note">Ответим в течение 24 часов</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Список обращений — только для администратора */}
            {isAdmin && feedbacks.length > 0 && (
              <div style={{marginTop: 32}}>
                <h3 className="section-title">Входящие обращения</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Email</th>
                      <th>Тема</th>
                      <th>Сообщение</th>
                      <th>Статус</th>
                      <th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb) => (
                      <tr key={fb.id}>
                        <td>{fb.name}</td>
                        <td>{fb.email}</td>
                        <td>{fb.subject}</td>
                        <td style={{maxWidth:200, wordBreak:'break-word'}}>{fb.message}</td>
                        <td>
                          <select
                            value={fb.status}
                            onChange={(e) => updateFeedbackStatus(fb.id, e.target.value)}
                            className="feedback-status-select"
                          >
                            <option value="new">Новое</option>
                            <option value="in_progress">В работе</option>
                            <option value="resolved">Решено</option>
                          </select>
                        </td>
                        <td>{new Date(fb.created_at).toLocaleString('ru-RU')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/*---------АУДИТ ------------- */}

        {activeSection === 'audit' && isAdmin && (
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Журнал действий</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Действие</th>
                  <th>Объект</th>
                  <th>Тип записи</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.entity}</td>
                    <td>{log.log_type === 'operator' ? 'Оператор' : 'Пользователь'}</td>
                    <td>{new Date(log.created_at).toLocaleString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* Модальное окно корзины */}
      {showCart && (
        <div className="modal-overlay" {...overlayProps(() => { setShowCart(false); setCartError(''); })}>
          <div className="modal-card cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Корзина</h3>
              <button className="modal-close-btn" onClick={() => { setShowCart(false); setCartError(''); }}>X</button>
            </div>
            {cartError && (
              <div className="cart-error">{cartError}</div>
            )}
            {cart.length === 0 ? (
              <p className="muted cart-empty">Корзина пуста</p>
            ) : (
              <>
                <div className="cart-list">
                  {cart.map((item) => (
                    <div key={item.product.id} className="cart-item">
                      <img
                        className="cart-item-img"
                        src={imgUrl(item.product.image_url)}
                        alt={item.product.name}
                      />
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.product.name}</p>
                        <p className="cart-item-price">{formatMoney(item.product.price)}</p>
                      </div>
                      <div className="cart-item-qty">
                        <button type="button" onClick={() => changeCartQty(item.product.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => changeCartQty(item.product.id, item.quantity + 1)}>+</button>
                      </div>
                      <div className="cart-item-subtotal">{formatMoney(item.product.price * item.quantity)}</div>
                      <button type="button" className="cart-item-remove" onClick={() => removeFromCart(item.product.id)}>X</button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Итого:</span>
                    <span className="cart-total-sum">{formatMoney(cartTotal)}</span>
                  </div>
                  <div className="cart-payment">
                    <label className="feedback-label">Адрес доставки *</label>
                    <input
                      className="cart-address-input"
                      placeholder="Город, улица, дом, квартира"
                      value={cartAddress}
                      onChange={(e) => setCartAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="cart-payment">
                    <label className="feedback-label">Способ оплаты</label>
                    <select className="cart-select" value={cartPayment} onChange={(e) => setCartPayment(e.target.value)}>
                      <option value="card">💳 Банковская карта</option>
                      <option value="cash">💵 Наличные при получении</option>
                    </select>
                  </div>
                  <button type="button" className="primary cart-checkout-btn" onClick={checkoutCart}>
                    Оформить заказ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно подробностей товара */}
      {selectedProduct && (
        <div className="modal-overlay" {...overlayProps(closeProductDetails)}>
          <div className="modal-card product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="product-modal-title">{selectedProduct.name}</h3>
              <button className="modal-close-btn" onClick={closeProductDetails}>X</button>
            </div>
            <div className="product-modal-body">
              <div className="product-modal-image-wrap">
                <img
                  className="product-modal-image"
                  src={imgUrl(selectedProduct.image_url)}
                  alt={selectedProduct.name}
                />
              </div>
              <div className="product-modal-info">
                <div className="product-modal-price">{formatMoney(selectedProduct.price)}</div>
                <div className="product-modal-meta">
                  <div className="product-modal-row">
                    <span className="product-modal-label">Категория</span>
                    <span>{categoryNameById[selectedProduct.category_id] || '—'}</span>
                  </div>
                  <div className="product-modal-row">
                    <span className="product-modal-label">Артикул</span>
                    <span>{selectedProduct.article || '—'}</span>
                  </div>
                  <div className="product-modal-row">
                    <span className="product-modal-label">Остаток</span>
                    <span>{selectedProduct.quantity} {selectedProduct.unit}</span>
                  </div>
                </div>
                {selectedProduct.description && (
                  <p className="product-modal-desc">{selectedProduct.description}</p>
                )}
                <div className="product-modal-actions">
                  <button
                    className="primary"
                    onClick={() => { addToCart(selectedProduct); closeProductDetails(); setShowCart(true); }}
                  >
                    Купить
                  </button>
                  <button
                    className="cart-add-btn"
                    onClick={() => addToCart(selectedProduct)}
                  >
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" {...overlayProps(closeEditModal)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Редактировать товар</h3>
              <button onClick={closeEditModal}>X</button>
            </div>
            <form className="form-grid" onSubmit={updateProductWithImage}>
              <select value={editForm.category_id}
                onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })} required>
                <option value="">Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input placeholder="Название" value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              <input placeholder="Артикул" value={editForm.article}
                onChange={(e) => setEditForm({ ...editForm, article: e.target.value })} />
              <input placeholder="Цена" type="number" step="0.01" min="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
              <input placeholder="Кол-во" type="number" min="0"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
              <input placeholder="Ед. изм" value={editForm.unit}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} />
              <div>
                <label style={{fontSize:13,color:'#496580',display:'block',marginBottom:4}}>Картинка</label>
                <label className="file-upload-btn">
                  Выбрать файл
                  <input type="file" accept="image/*" style={{display:'none'}}
                    onChange={(e) => setEditForm({ ...editForm, imageFile: e.target.files[0] || null })} />
                </label>
                {editForm.imageFile && (
                  <span className="file-upload-name">{editForm.imageFile.name}</span>
                )}
                <input placeholder="Или вставьте URL картинки" value={editForm.image_url}
                  onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                  style={{marginTop:6}} />
              </div>
              <textarea placeholder="Описание" value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <button type="submit" className="primary">Сохранить изменения</button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования клиента */}

      {isEditClientOpen && (
        <div className="modal-overlay" {...overlayProps(closeEditClient)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Редактировать клиента</h3>
              <button onClick={closeEditClient}>X</button>
            </div>
            <form className="form-grid" onSubmit={updateClient}>
              <input placeholder="Email" type="email" value={editClientForm.email}
                onChange={(e) => setEditClientForm({ ...editClientForm, email: e.target.value })} required />
              <input placeholder="Имя Фамилия" value={editClientForm.full_name}
                onChange={(e) => setEditClientForm({ ...editClientForm, full_name: e.target.value })} required />
              <input placeholder="+7(999)999-99-99" value={editClientForm.phone}
                onChange={(e) => setEditClientForm({ ...editClientForm, phone: formatPhoneInput(e.target.value, editClientForm.phone) })}
                onKeyDown={(e) => phoneKeyDown(e, editClientForm.phone, setEditClientForm, 'phone', editClientForm)} />
              <button type="submit" className="primary">Сохранить</button>
            </form>
          </div>
        </div>
      )}
      {/* Модальное окно успешного заказа */}
      {showOrderSuccess && (
        <div className="modal-overlay" {...overlayProps(() => setShowOrderSuccess(false))}>
          <div className="modal-card order-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-success-icon">✓</div>
            <h3 className="order-success-title">Заказ оформлен!</h3>
            <p className="order-success-text">
              Ваш заказ успешно принят. Мы свяжемся с вами для подтверждения доставки.
            </p>
            <button className="primary" onClick={() => setShowOrderSuccess(false)}>Отлично!</button>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования питомца */}
      {editingPet && (
        <div className="modal-overlay" {...overlayProps(closeEditPet)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Редактировать питомца</h3>
              <button onClick={closeEditPet}>X</button>
            </div>
            <form className="form-grid" onSubmit={updatePet}>
              <input placeholder="Кличка" value={editPetForm.name}
                onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })} required />
              <select value={editPetForm.species}
                onChange={(e) => setEditPetForm({ ...editPetForm, species: e.target.value })}>
                <option value="dog">Собака</option>
                <option value="cat">Кошка</option>
                <option value="bird">Птица</option>
                <option value="fish">Рыба</option>
                <option value="rodent">Грызун</option>
                <option value="other">Другое</option>
              </select>
              <input placeholder="Порода" value={editPetForm.breed}
                onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })} />
              <input placeholder="Вес, кг" type="number" step="0.01" value={editPetForm.weight}
                onChange={(e) => setEditPetForm({ ...editPetForm, weight: e.target.value })} />
              <input placeholder="Обхват, см" type="number" step="0.01" value={editPetForm.body_girth}
                onChange={(e) => setEditPetForm({ ...editPetForm, body_girth: e.target.value })} />
              <input placeholder="Длина спины, см" type="number" step="0.01" value={editPetForm.back_length}
                onChange={(e) => setEditPetForm({ ...editPetForm, back_length: e.target.value })} />
              <button type="submit" className="primary">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования категории */}
      {editingCategory && (
        <div className="modal-overlay" {...overlayProps(closeEditCategory)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Редактировать категорию</h3>
              <button onClick={closeEditCategory}>X</button>
            </div>
            <form className="form-grid" onSubmit={updateCategory}>
              <input
                placeholder="Название категории"
                value={editCategoryForm.name}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                required
              />
              <button type="submit" className="primary">Сохранить</button>
            </form>
          </div>
        </div>
      )}
    </div>
      <Footer setActiveSection={setActiveSection} />
    </div>
  );
}

export default App;