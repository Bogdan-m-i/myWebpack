function requireAll(r) {
  r.keys().forEach(r);
}

requireAll(require.context('@/assets/img/icons/', true, /\.svg$/));
