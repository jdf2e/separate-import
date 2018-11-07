### @nutui/separate-import

---

按需引入Nutui2.0组件，减小打包体积；

### 安装

---

```bash
npm i -D @nutui/separate-import
```

### 使用

---

配置`.babelrc`文件：

```js
{
  "plugins": [
    ["@nutui/separate-import", {
        "libraryName": "@nutui/nutui",
        "libraryDirectory": "dist/src/packages",
        "style": "css"
    }]
  ]
}

```

然后就可以像下面这样按需引入组件了：

```js
import Vue from 'vue';
import { Button, Icon } from '@nutui/nutui';

Vue.use(Button);
Vue.use(Icon);
```

### AST转换

---

```js
import { Button } from '@nutui/nutui';
```
当使用这种方式`import`组件时，将会被转换为：
```js
import Button from '@nutui/nutui/dist/src/packages/button/button.js';
import '@nutui/nutui/dist/src/packages/button/button.css';
```

* 如果`style`选项为`css`，则会加载相应组件的`css`；

* 如果`style`选项为`scss`，则会加载相应组件的`scss`；

* 如果没有`style`选项，则不会加载样式文件，需用户手动添加；

