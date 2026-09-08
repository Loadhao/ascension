---
title: 常用注解地图：Java / Spring / Spring Boot
description: 元注解地基、组件注册与注入、Web MVC、事务与异步、条件装配——三层框架高频注解的分组速查与原理要点
level: intermediate
core: true
---

## 先补一层地基：Java 元注解

所有框架注解都是"注解的注解"定义出来的，读懂这五个才算入了门：

| 元注解 | 作用 | 记忆点 |
| --- | --- | --- |
| `@Retention` | 活到哪个阶段 | RUNTIME 才能被框架反射读到（见[反射与注解](/java/basic/syntax/06-reflection-annotation/)） |
| `@Target` | 能贴在哪 | METHOD/FIELD/TYPE/PARAMETER… |
| `@Inherited` | 子类继承父类的注解 | **只认类继承，接口与接口实现不传递** |
| `@Documented` | 进 javadoc | 无运行期影响 |
| `@Repeatable` | 可重复贴 | 同一位置贴多次（如 @Scheduled 多个任务） |

Java 自带的标准注解同理：`@Override`（编译器校验）、`@Deprecated`（弃用
标记）、`@SuppressWarnings`（压告警）、`@FunctionalInterface`（函数式
接口声明）——它们都是 SOURCE/编译期消费，运行期不存在。

## Spring：声明 Bean

| 注解 | 说明 |
| --- | --- |
| `@Component` | 通用组件；`@Service`/`@Repository`/`@Controller` 是语义化马甲 |
| `@Configuration` + `@Bean` | 配置类方法级声明；**第三方类只能走这条** |
| `@ComponentScan` | 指定扫描路径（默认扫配置类所在包及子包） |
| `@Import(Xxx.class)` | 直接导入配置类 / ImportSelector 产物 |
| `@Lazy` | 首次使用才初始化 |
| `@Scope` | 作用域（singleton/prototype/…） |

@Configuration 的一个隐藏机制：配置类被 CGLIB 增强，`@Bean` 方法互相
调用不会 new 出第二份——`orderService()` 内部调 `paymentService()` 拿的
是容器单例。这也是 `proxyBeanMethods=false`（lite 模式）能提速的原因：
关掉代理就没有这份拦截。

## Spring：注入与配置

| 注解 | 说明 |
| --- | --- |
| `@Autowired` | 按类型注入；多个候选配 `@Qualifier` 指名 |
| `@Primary` | 多实现时标默认；与 @Qualifier 相遇时 Qualifier 优先 |
| `@Resource` | JSR-250，按名称优先（语义对比见 [IoC 篇](/java/intermediate/spring/01-ioc-bean-lifecycle/)） |
| `@Value("${key}")` | 单值注入，支持 SpEL；复杂对象用下面的 Properties |
| `@ConfigurationProperties(prefix="app")` | 整段配置绑定成对象，支持宽松命名与校验 |

## Spring MVC：HTTP 层

| 注解 | 说明 |
| --- | --- |
| `@RestController` | = `@Controller` + `@ResponseBody` 的组合注解 |
| `@RequestMapping` | URL 映射；`@GetMapping` 等是方法级马甲 |
| `@RequestParam` / `@PathVariable` / `@RequestBody` | 查询参数 / 路径段 / 请求体，三种来源 |
| `@RequestHeader` / `@CookieValue` | 头与 Cookie |
| `@ControllerAdvice` + `@ExceptionHandler` | 全局异常兜底（机制见[统一异常处理](/java/intermediate/spring/08-exception-advice/)） |
| `@CrossOrigin` | 声明式 CORS（更细的放全局配置） |
| `@Valid` / `@NotNull` 等 | JSR-303 校验触发器与约束 |

这些注解能生效，靠的是启动期把它们注册进 `RequestMappingHandlerMapping`、
请求期由 ArgumentResolver/MessageConverter 解析——执行位置见
[Spring MVC 请求处理全流程](/java/intermediate/spring/09-springmvc-flow/)。

## Spring：AOP、事务、异步与事件

| 注解 | 说明 |
| --- | --- |
| `@Aspect` / `@Pointcut` / `@Around` 等 | 切面三件套（写法见 [AOP 篇](/java/intermediate/spring/02-aop/)） |
| `@Transactional` | 声明式事务；失效场景见[事务篇](/java/intermediate/spring/04-transaction/) |
| `@Async` | 方法丢线程池异步执行；**自调用失效**（同为 AOP 马甲） |
| `@Scheduled` | 定时任务；需配 `@EnableScheduling`，单机执行、集群会重复跑 |
| `@EventListener` | 方法级事件监听，参数类型即事件类型 |
| `@TransactionalEventListener` | 事务提交后才消费事件（防止消费者查库查不到未提交数据） |

`@EnableXxx` 家族（@EnableAsync/@EnableScheduling/@EnableCaching…）是
Spring 的"功能开关"套路：背后都是 `@Import` 一个配置类，注册一批
BeanPostProcessor/Advisor——开关一开，对应的扩展点就上岗。

## Spring Boot：装配与条件

| 注解 | 说明 |
| --- | --- |
| `@SpringBootApplication` | = `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan` |
| `@EnableAutoConfiguration` | 按 classpath 条件加载自动配置（原理见[自动配置篇](/java/intermediate/spring/05-springboot-autoconfig/)） |
| `@ConditionalOnClass` / `@ConditionalOnMissingBean` / `@ConditionalOnProperty` | 条件装配三巨头：有某个类才生效 / 用户没定义才兜底 / 配置开关 |
| `@ConfigurationProperties` | 配置绑定（配合 `@EnableConfigurationProperties` 注册） |
| `@Profile("prod")` | 按环境装配 Bean |
| `@SpringBootTest` / `@MockBean` | 集成测试起容器 + 替换 Bean |

条件注解是 starter 幂等的全部秘密：`@ConditionalOnMissingBean` 保证
"用户自己配了就用用户的，没配才给默认值"。

## 组合注解与自定义注解

Spring 满屏的组合注解证明了这套玩法：`@RestController`、
`@GetMapping`、`@Transactional(readOnly=true)` 都是把常用组合固化。
自定义注解的标准姿势：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Transactional(rollbackFor = Exception.class)   // 元注解叠加 = 组合
@Lock("order")                                  // 自定义注解也能当元注解
public @interface OrderTx { }
```

要点两条：

- **元数据合并查找**：切面里要用
  `AnnotatedElementUtils.findMergedAnnotation(method, Transactional.class)`
  而不是 `getAnnotation`——后者只查"直接贴在方法上"的注解，读不到
  组合注解里的那一层。
- **`@AliasFor`**：让自定义注解的属性桥接元注解属性，比如自定义
  `@MyGetMapping(path)` 把值别名给 `@RequestMapping.path`，Spring MVC
  才能把你的注解当原生映射识别。

## 小结

- 元注解是读懂一切注解的地基；RUNTIME 保留 + 反射消费是框架注解的
  标配形态。
- 按层记地图：声明（@Component/@Bean）→ 注入（@Autowired/
  ConfigurationProperties）→ Web（@RestController 家族）→ 横切
  （@Transactional/@Async，全是 AOP 马甲）→ 装配（@ConditionalOnXxx）。
- @EnableXxx = @Import 开关；组合注解 + @AliasFor 是自定义注解的
  正确打开方式，查找记得用 findMergedAnnotation。
