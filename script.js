(() => {
  const button = document.querySelector('.menu-button');
  const overlay = document.querySelector('.menu-overlay');

  const setMenu = (open) => {
    if (!button || !overlay) return;
    button.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    overlay.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };

  if (button && overlay) {
    button.addEventListener('click', () => {
      setMenu(!overlay.classList.contains('is-open'));
    });

    overlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });
  }

  const workRoot = document.querySelector('[data-work-root]');
  let panels = [];
  let tabs = [];
  let activeWorkId = null;

  /*
   * Finished Product リンク
   * ----------------------------------------
   * works-personal.html のように、ページ内の一部タブだけ
   * Finished Product を持つ場合にも対応します。
   */
  let finishedMenuLink = overlay?.querySelector('a[href="#finished"]') || null;

  if (!finishedMenuLink && overlay && workRoot?.querySelector('.finished')) {
    const worksLink = overlay.querySelector('a[href="#works-nav"]');
    const worksItem = worksLink?.closest('li');

    const finishedItem = document.createElement('li');
    finishedItem.className = 'menu-finished-item';

    finishedMenuLink = document.createElement('a');
    finishedMenuLink.href = '#finished';
    finishedMenuLink.textContent = 'Finished Product';

    finishedItem.appendChild(finishedMenuLink);

    if (worksItem) {
      worksItem.parentNode.insertBefore(finishedItem, worksItem);
    } else {
      overlay.querySelector('nav ul')?.appendChild(finishedItem);
    }

    finishedMenuLink.addEventListener('click', () => setMenu(false));
  }

  const getActivePanel = () => {
    if (!workRoot) return null;

    return (
      panels.find((panel) => panel.dataset.workPanel === activeWorkId) ||
      panels.find((panel) => !panel.hidden) ||
      null
    );
  };

  const getFinishedTarget = () => {
    const activePanel = getActivePanel();

    // 現在開いている 01 / 02 / 03 / 04 内の Finished Product を優先
    return (
      activePanel?.querySelector('.finished') ||
      activePanel?.querySelector('#finished') ||
      null
    );
  };

  const updateFinishedMenu = () => {
    if (!finishedMenuLink) return;

    const item = finishedMenuLink.closest('li');
    const hasFinished = Boolean(getFinishedTarget());

    if (item) {
      item.hidden = !hasFinished;
    }

    finishedMenuLink.setAttribute('aria-hidden', String(!hasFinished));
    finishedMenuLink.tabIndex = hasFinished ? 0 : -1;
  };

  if (workRoot) {
    panels = [...workRoot.querySelectorAll('[data-work-panel]')];
    tabs = [...workRoot.querySelectorAll('[data-work-tab]')];

    const params = new URLSearchParams(location.search);
    const first = panels[0]?.dataset.workPanel || '01';
    const requested = params.get('work') || first;

    const showWork = (id, updateUrl = false) => {
      const exists = panels.some((panel) => panel.dataset.workPanel === id);
      const target = exists ? id : first;

      activeWorkId = target;

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.workPanel !== target;
      });

      tabs.forEach((tab) => {
        const active = tab.dataset.workTab === target;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });

      if (updateUrl) {
        const url = new URL(location.href);
        url.searchParams.set('work', target);
        history.replaceState({}, '', url);
      }

      // タブを切り替えるたびに Finished Product の有無を更新
      updateFinishedMenu();
    };

    showWork(requested);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        showWork(tab.dataset.workTab, true);
      });
    });
  }

  /*
   * ページ内リンクのスムーズスクロール
   * #finished だけは document.querySelector('#finished') を使わず、
   * 現在表示中のタブ内にある Finished Product を取得します。
   */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') return;

      let target = null;

      if (targetId === '#finished') {
        target = getFinishedTarget();
      } else {
        target = document.querySelector(targetId);
      }

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  updateFinishedMenu();
})();
