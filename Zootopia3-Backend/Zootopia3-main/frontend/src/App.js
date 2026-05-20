import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { Phone, Mail, Search, User, LogIn, Sparkles } from 'lucide-react';

const ROLE_LABELS = {
  admin: 'Администратор',
  seller: 'Продавец',
  client: 'Клиент',
};

const PAYMENT_LABELS = {
  cash: 'Наличные',
  card: 'Банковская карта',
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
            <h1 className="header-logo-text">Зоомагазин</h1>
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
            {/* Кнопка корзины — показывает количество товаров */}
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
          <p>&copy; 2026 Зоомагазин. Все права защищены.</p>
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
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartPayment, setCartPayment] = useState('cash');

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [activeSection, setActiveSection] = useState('products');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pets, setPets] = useState([]);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
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
    payment_type: 'cash',
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
    /* Поддержка доступна всем кроме администратора */
    if (!isAdmin) items.push({ id: 'feedback', label: 'Поддержка' });
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
        /* Поиск по названию товара и по категории */
        const matchesSearch = item.name.toLowerCase().includes(q) || categoryName.includes(q);
        const matchesCat =
          productCategoryFilter === null || Number(item.category_id) === Number(productCategoryFilter);
        return matchesSearch && matchesCat;
      }),
    [products, productSearch, productCategoryFilter, categoryNameById]
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
    /* Товары и категории загружаются без токена */
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
      if (section === 'clients') setClients(await api('/clients/'));
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
    if (!token) return;
    refreshMe().catch((e) => {
      setError(e.message);
      handleLogout();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* Загружаем категории для сайдбара без авторизации */
  useEffect(() => {
    (async () => {
      try {
        const cats = await api('/categories/');
        setCategories(cats);
      } catch (e) {
        /* sidebar categories optional */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSectionData(activeSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, token, user?.role]);

  /* Переход к разделу — гость попадает в раздел и видит блок авторизации */
  const goToSection = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (authMode === 'login') {
        const data = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: authForm.email, password: authForm.password }),
        });
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setShowAuthModal(false);
        setMessage('Вход выполнен');
      } else {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify(authForm),
        });
        setMessage('Регистрация успешна, теперь войдите');
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

  const saveProduct = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/products/', {
        method: 'POST',
        body: JSON.stringify({
          ...productForm,
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
      const created = await api('/products/', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
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
        .map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) }));

      if (items.length === 0) { setError('Добавьте хотя бы один товар'); return; }

      await api('/sales/', {
        method: 'POST',
        body: JSON.stringify({
          client_id: saleForm.client_id ? Number(saleForm.client_id) : null,
          payment_type: saleForm.payment_type,
          items,
        }),
      });
      setMessage('Продажа создана');
      setSaleForm({ client_id: '', payment_type: 'cash', items: [{ product_id: '', quantity: 1 }] });
      loadSectionData('sales');
    } catch (e2) {
      setError(e2.message);
    }
  };

  /* Создать сотрудника — только роль seller */
  const saveUser = async (e) => {
    e.preventDefault();
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
    setEditClientForm({ full_name: client.full_name, phone: client.phone || '' });
    setIsEditClientOpen(true);
  };

  const closeEditClient = () => {
    setIsEditClientOpen(false);
    setEditingClient(null);
    setEditClientForm({ full_name: '', phone: '' });
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
    try {
      const result = await api('/recommendations/generate', { method: 'POST' });
      setMessage(result.message || 'Рекомендации сгенерированы');
      loadSectionData('recommendations');
    } catch (e) {
      setError(e.message);
    }
  };

  const trainRecommendations = async () => {
    try {
      const result = await api('/recommendations/train', { method: 'POST' });
      setMessage(result.message || 'Модель обучена');
    } catch (e) {
      setError(e.message);
    }
  };

  /* Добавить товар в корзину */
  const addToCart = (product) => {
    if (!token) { setShowAuthModal(true); return; }
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
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
    setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  /* Оформить заказ из корзины */
  const checkoutCart = async () => {
    if (cart.length === 0) return;
    setError('');
    try {
      const items = cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity }));
      await api('/sales/', {
        method: 'POST',
        body: JSON.stringify({ payment_type: cartPayment, items }),
      });
      setCart([]);
      setShowCart(false);
      setMessage('Заказ успешно оформлен!');
    } catch (e) {
      setError(e.message);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const formatMoney = (value) => Number(value).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });

  const goToProducts = (categoryId) => {
    setProductCategoryFilter(categoryId);
    setActiveSection('products');
  };

  /* --------- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ------------- */

  const authModalContent = (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
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
              <input id="m-phone" placeholder="+7..."
                value={authForm.phone}
                onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} />
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
        {/* Если пользователь вошёл — показываем имя и кнопку выхода */}
        {user ? (
          <div className="user-chip">
            <p className="user-name">{user?.full_name}</p>
            <p className="user-role">{roleLabel(user?.role)}</p>
          </div>
        ) : (
          /* Если не вошёл — показываем кнопку входа */
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
                {categories.map((c) => (
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

          {/* Разделы только для авторизованных */}
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

        {/* Блок-заглушка для гостя в разделе, требующем авторизации */}
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
                onClick={() => setProductCategoryFilter(null)}
              >
                Все
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={productCategoryFilter === c.id ? 'category-chip active' : 'category-chip'}
                  onClick={() => setProductCategoryFilter(c.id)}
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
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input placeholder="Название" value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                <input placeholder="Артикул" value={productForm.article}
                  onChange={(e) => setProductForm({ ...productForm, article: e.target.value })} />
                {/* Цена не может быть ниже 0.01 */}
                <input placeholder="Цена" type="number" step="0.01" min="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                {/* Количество не может быть отрицательным */}
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
                      {/* Кнопка добавления в корзину — для всех кроме admin/seller */}
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
              <select
                value={categoryForm.parent_id}
                onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
              >
                <option value="">Без родительской категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button className="primary" type="submit">Добавить</button>
            </form>
            <ul className="category-admin-list">
              {categories.map((c) => (
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
                  <option value="cash">Наличные</option>
                  <option value="card">Банковская карта</option>
                </select>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {saleForm.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        placeholder="ID товара"
                        type="number"
                        min="1"
                        value={item.product_id}
                        onChange={(e) => {
                          const updated = [...saleForm.items];
                          updated[idx] = { ...updated[idx], product_id: e.target.value };
                          setSaleForm({ ...saleForm, items: updated });
                        }}
                        style={{ flex: 2 }}
                        required
                      />
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
              {sales.map((sale) => (
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
              <input placeholder="Телефон" value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
              <button className="primary" type="submit">Создать</button>
            </form>

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
                {clients.map((c) => (
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

        {/*---------СОТРУДНИКИ (переименовано из Пользователи) ------------- */}

        {activeSection === 'users' && isAdmin && (
          <section className="card section-card">
            <div className="section-header">
            </div>
            <form className="form-grid" onSubmit={saveUser}>
              {/* Только сотрудник — вариант admin убран */}
              <h3 className="section-form-title">Создать сотрудника</h3>
              <input placeholder="Email" type="email" value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <input placeholder="Пароль" type="password" value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
              <input placeholder="ФИО" value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} required />
              <input placeholder="Телефон" value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              <select value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                {/* Только продавец — вариант admin недоступен */}
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
            <div className="section-header">
            </div>
            <div className="actions">
              {(role === 'client' || isAdmin) && (
                <button type="button" className="primary" onClick={generateRecommendations}>
                  Сгенерировать рекомендации
                </button>
              )}
              {isAdmin && (
                <button type="button" onClick={trainRecommendations}>
                  Обучить модель
                </button>
              )}
            </div>
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
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="modal-card cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Корзина</h3>
              <button className="modal-close-btn" onClick={() => setShowCart(false)}>X</button>
            </div>
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
                    <label className="feedback-label">Способ оплаты</label>
                    <select value={cartPayment} onChange={(e) => setCartPayment(e.target.value)}>
                      <option value="cash">Наличные</option>
                      <option value="card">Банковская карта</option>
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
        <div className="modal-overlay" onClick={closeProductDetails}>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования товара — только для администратора */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
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
              {/* Цена не может быть ниже 0.01 */}
              <input placeholder="Цена" type="number" step="0.01" min="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
              {/* Количество не может быть отрицательным */}
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
        <div className="modal-overlay" onClick={closeEditClient}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Редактировать клиента</h3>
              <button onClick={closeEditClient}>X</button>
            </div>
            <form className="form-grid" onSubmit={updateClient}>
              <input placeholder="Имя Фамилия" value={editClientForm.full_name}
                onChange={(e) => setEditClientForm({ ...editClientForm, full_name: e.target.value })} required />
              <input placeholder="Телефон" value={editClientForm.phone}
                onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })} />
              <button type="submit" className="primary">Сохранить</button>
            </form>
          </div>
        </div>
      )}
      {/* Модальное окно редактирования питомца */}
      {editingPet && (
        <div className="modal-overlay" onClick={closeEditPet}>
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
        <div className="modal-overlay" onClick={closeEditCategory}>
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
              <select
                value={editCategoryForm.parent_id}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, parent_id: e.target.value })}
              >
                <option value="">Без родительской категории</option>
                {categories
                  .filter((c) => c.id !== editingCategory.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
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