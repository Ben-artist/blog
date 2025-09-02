---
title: TS系列 - 从设计者的角度理解TypeScript
date: 2025-03-07
tags: ['TypeScript', '类型系统', '前端开发']
---

作为前端开发者，我们在日常工作中频繁使用 TypeScript 编写代码。然而，我们是否真正理解了 TypeScript 的设计理念？本文将从语言设计者的视角，深入剖析 TypeScript 的核心设计思想

---

## 1. Interface 与 Type：设计意图的差异

TypeScript 提供了两种主要方式来定义类型：`interface`和`type`。虽然它们在很多场景下可以互换使用，但背后的设计理念和适用场景却有着本质区别。

### 1.1 共同特性

- 都可以定义对象结构、函数签名等类型
- 都支持泛型
- 都可以被用于类型注解
- 都支持索引签名和可选属性

```typescript
// 使用interface定义对象结构
interface User {
  id: number
  name: string
  email?: string // 可选属性
}

// 使用type定义相同的结构
type User = {
  id: number
  name: string
  email?: string
}
```

### 1.2 核心差异

#### 声明合并与扩展性

`interface`设计为**开放式**，支持声明合并（Declaration Merging）：

```typescript
interface ApiResponse {
  status: number
}

interface ApiResponse {
  data: unknown
}

// 自动合并为:
// interface ApiResponse {
//   status: number;
//   data: unknown;
// }
```

而`type`则是**封闭式**的，一旦定义就不能再添加新属性：

```typescript
type ApiResponse = {
  status: number
}

// 错误: 标识符'ApiResponse'重复
type ApiResponse = {
  data: unknown
}
```

#### 继承与交叉

`interface`使用`extends`关键字实现继承，语义更接近面向对象编程：

```typescript
interface Animal {
  name: string
}

interface Dog extends Animal {
  bark(): void
}
```

`type`则使用交叉类型（`&`）组合类型：

```typescript
type Animal = {
  name: string
}

type Dog = Animal & {
  bark(): void
}
```

#### 高级类型操作

`type`能够表达更复杂的类型关系，如联合类型、条件类型等：

```typescript
// 联合类型
type Status = 'pending' | 'fulfilled' | 'rejected'

// 条件类型
type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : never
```

### 1.3 设计意图解析

为什么 TypeScript 设计了两种看似重叠的类型定义方式？这背后有深思熟虑的考量：

#### 语义区分

- `interface`：强调**契约**和**结构一致性**，更适合定义 API 形状、类实现的接口、对象的公共结构等。名称本身就暗示了"接口"的概念—一个组件与外界交互的边界。

- `type`：本质上是**类型别名**（Type Alias），强调为类型提供名称和组合现有类型。它更适合表达复杂类型关系、类型转换和类型操作。

#### 实际应用指南

基于设计理念，我们可以遵循以下实践原则：

- 当定义公共 API、类实现的接口、对象结构时，优先使用`interface`
- 当需要利用联合类型、交叉类型、条件类型等高级类型特性时，使用`type`
- 当需要扩展第三方类型时，优先考虑`interface`的声明合并特性

## 2. 协变与逆变：类型关系的本质

在 TypeScript 的类型系统中，协变(Covariance)和逆变(Contravariance)是两个核心概念，它们决定了复杂类型之间的兼容性关系。理解这些概念对于掌握 TypeScript 的类型检查逻辑至关重要。

### 2.1 协变（Covariance）

协变是类型系统中的一种类型关系，它描述了子类型可以替代父类型的情况。

#### 定义与原理

- 子类型可以替代父类型（如果`T`是`U`的子类型，那么`Covariant<T>`也是`Covariant<U>`的子类型）
- 符号表示：`T extends U → Covariant<T> extends Covariant<U>`
- 典型场景：容器类型（如数组、对象属性）的数据输出方向

```typescript
class Animal {
  name: string
  constructor(name: string) {
    this.name = name
  }

  eat(): void {
    console.log(`${this.name} is eating.`)
  }
}

class Dog extends Animal {
  breed: string
  constructor(name: string, breed: string) {
    super(name)
    this.breed = breed
  }

  bark(): void {
    console.log(`${this.name} says: Woof!`)
  }
}

// 协变示例
class Container<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
}

// Dog是Animal的子类型，所以Container<Dog>是Container<Animal>的子类型
const dogContainer = new Container<Dog>(new Dog('Rex', 'German Shepherd'))
const animalContainer: Container<Animal> = dogContainer // 协变允许这种赋值

// 读取操作是安全的
animalContainer.value.eat() // 正常工作
```

#### 设计原因

- **里氏替换原则**：子类型对象在父类型接口下应能无缝替换，协变为此提供了类型安全保障
- **数据读取安全性**：当容器仅用于读取数据时，子类型的数据可以被父类型容器接收，因为子类型满足父类型的所有契约
- **代码复用性**：允许更通用的代码处理特定子类型，减少重复代码

### 2.2 逆变（Contravariance）

逆变是类型系统中的一种类型关系，它描述了父类型可以替代子类型的情况，主要出现在函数参数类型中。

#### 定义与原理

- 父类型可以替代子类型（如果`U`是`T`的父类型，那么`Contravariant<U>`是`Contravariant<T>`的子类型）
- 符号表示：`U extends T → Contravariant<U> extends Contravariant<T>`
- 典型场景：函数参数类型的数据输入方向

```typescript
// 函数类型定义
type AnimalHandler = (animal: Animal) => void
type DogHandler = (dog: Dog) => void

// 创建一个处理任何动物的函数
const handleAnimal: AnimalHandler = (animal: Animal) => {
  console.log(`Handling animal: ${animal.name}`)
  animal.eat()
}

// 创建一个专门处理狗的函数
const handleDog: DogHandler = (dog: Dog) => {
  console.log(`Handling dog: ${dog.name} (${dog.breed})`)
  dog.eat()
  dog.bark()
}

// 逆变示例
// 可以将接受更一般类型(Animal)的函数赋值给接受更具体类型(Dog)的函数变量
const safeDogHandler: DogHandler = handleAnimal // 这是安全的

// 这是安全的，因为handleAnimal只使用了Animal共有的方法
safeDogHandler(new Dog('Fido', 'Mixed'))

// 但反过来是不安全的
// const unsafeAnimalHandler: AnimalHandler = handleDog; // 类型错误！
```

#### 设计原因

- **函数参数的宽松性**：当函数接受输入参数时，父类型的处理函数可以安全地处理子类型的实例
- **类型安全保障**：防止在运行时调用不存在的方法，如将期望`Dog`参数的函数赋值给接受`Animal`的变量，可能导致调用不存在的`bark()`方法
- **多态性支持**：允许更通用的处理函数替代特定类型的处理函数，增强代码的灵活性

### 2.4 理解协变和逆变的关键点

1. **协变（Covariance）**：
   - 允许子类型替换父类型
   - 适用于数据输出位置（返回值、读取属性）
   - 符合直觉：如果需要 Animal，提供 Dog 是安全的

:::details 符合直觉
想象你去宠物店，店员问你想要什么动物作为宠物。你说："我想要一只动物，任何动物都行。"
然后店员给你带来一只狗。
这完全满足了你的要求，因为狗确实是动物，它具备所有动物应有的特性（比如吃、睡等）。你不会说："等等，我要的是动物，不是狗！"因为狗就是动物的一种。
:::

2. **逆变（Contravariance）**：
   - 允许父类型替换子类型
   - 适用于数据输入位置（函数参数）
   - 不太直观但合理：如果函数能处理任何 Animal，它也能处理 Dog

:::details 不太直观但合理
想象你有一个动物医院，需要雇佣一位兽医。你有两个应聘者：

    - 通用兽医：能治疗任何动物
    - 狗专科兽医：只能治疗狗

    现在，如果你的医院专门只收治狗，你会雇佣哪一位？
    显然，两位都可以胜任这份工作，因为通用兽医虽然能力更广（能治疗任何动物），但当然也包括了治疗狗的能力。这就是为什么接受 Animal 参数的函数可以安全地替代接受 Dog 参数的函数。

```ts
// 通用兽医 - 能处理任何动物
function generalVet(animal: Animal) {
  console.log(`检查${animal.name}的健康`)
  animal.eat() // 只调用Animal共有的方法
}

// 狗专科兽医 - 只能处理狗
function dogVet(dog: Dog) {
  console.log(`检查${dog.name}的健康`)
  dog.bark() // 调用Dog特有的方法
}

// 在只需要处理狗的场景中：
type DogDoctor = (dog: Dog) => void

// 通用兽医可以安全地替代狗专科医生的职位
const dogDoctor: DogDoctor = generalVet // 类型安全！

// 但反过来不行
// const animalDoctor: (animal: Animal) => void = dogVet; // 类型错误！
```
:::

## 3.函数的兼容性

### 3.1 重载

ts 只能模拟函数重载，因为如果真的有同名函数，则会覆盖，所以 ts 会根据参数类型和数量来决定调用哪个重载

```ts
function add(a: number, b: number): number
function add(a: string, b: string): string
```
这是函数的实现，需要兼容所有重载签名
```ts
function add(a: number | string, b: number | string): number | string {
  return a + b
}

const res = add(1, 2) // number
const res2 = add('1', '2') // string
```
### 3.2 函数参数的兼容性

函数参数的兼容性是指函数参数的类型是否可以被其他类型替换。

```ts
type Func = (a:string,b:string)=>void
let sum:Func

let f1 = (a:string)=>{}
let f2 = ()=>{}

let f3 = (a:string,b:string,c:string)=>{}

 sum = f1
 sum = f2
 // 错误，函数体还是f3，但是形参是 sum 的
 sum = f3 // [!code error]
 ```
 `=` 赋值不应该把右边的变量赋值给左边吗，然后他们俩是一直的吗？那么为啥 f3 不行？

**TypeScript 的类型检查发生在 ​编译时，而不是运行时。** 它会静态分析以下内容：

- 函数的参数数量是否匹配？
- 每个参数的类型是否兼容（比如 number 是否兼容 string）？
- 返回值类型是否匹配？

**但不会检查函数体内部的行为，会检查函数签名**

## 4. 泛型

```ts
// 泛型在函数内部
type ICallBack1 = <T>(item: T, idx: number) => void;

// 泛型在函数外部
type ICallBack2<T> = (item: T, idx: number) => void;
```

| 特性 | ICallBack1（泛型在函数内） | ICallBack\<T>（泛型在接口外） |
| :----: | :--------------------------: | :----------------------------: |
| 泛型参数位置 | 函数签名的一部分（\<T> 在箭头前） | 接口类型变量（T 在接口名后） |
| 类型确定时机 | 必须在声明函数时显式指定（如 ICallBack1\<number>） | 可显式指定或由 TypeScript 推断（如 ICallBack） |
| 函数重载支持 | 难以直接重载（需手动定义多个泛型实例） | 支持通过泛型参数实现多态行为 |
| 常见用途 | API 回调、明确类型约束的场景 | 通用数据处理、泛型工具函数 |

1. **ICallBack1**

泛型参数 \<T> 是函数类型的一部分，类似于 JavaScript 的函数重载。每次定义函数实例时，必须显式指定 \<T> 的具体类型：
```ts
const handleString: ICallBack1<string> = (item, idx) => {}; // 显式指定 T[string]
const handleNumber: ICallBack1<number> = (item, idx) => {};   // 显式指定 T[number]
```
这种设计强制你在编译时绑定类型，适合需要严格类型隔离的场景（如不同业务模块的专用回调）

2. **ICallBack\<T>**：
泛型参数 T 是接口的类型变量，函数本身不携带泛型信息。类型 T 的确定可以延迟到接口实例化时：

```ts
const handleDynamic: ICallBack<number> = (item, idx) => {}; // 显式指定 T[number]
const handleAny: ICallBack = (item, idx) => {};             // TypeScript 自动推断 T[any]
```

这种设计允许更灵活的类型组合，适合需要通用逻辑复用的场景（如数据处理函数）

<!-- ## 5. 联合与交叉的本质

联合类型（Union Types）：

- 表示一个值可以是多种类型中的一种
- 使用 `|` 符号表示
- 例如：`string | number | boolean`

交叉类型（Intersection Types）：

- 表示一个值同时具有多种类型
- 使用 `&` 符号表示
- 例如：`{ a: string } & { b: number }` -->







