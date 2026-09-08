import type { ListFrame, ListNodeItem, ListVizConfig } from '../../components/viz/ListViz';
import type { StackFrame, StackVizConfig, StackSpec } from '../../components/viz/StackViz';
import type { TreeFrame, TreeNodeItem, TreeVizConfig } from '../../components/viz/TreeViz';

// ===== 链表 =====

const listSnap = (items: ListNodeItem[]): ListNodeItem[] => items.map((it) => ({ ...it }));
const setNext = (items: ListNodeItem[], id: number, next: number | null) => {
	items.find((it) => it.id === id)!.next = next;
};

/** 反转链表：prev/curr/next 三指针迭代，箭头逐一调头 */
function reverseListDemo(): ListVizConfig {
	const labels = ['1', '2', '3', '4', '5'];
	const n = labels.length;
	const items = labels.map((label, i) => ({ id: i + 1, label, next: i + 1 < n ? i + 2 : null }));
	const frames: ListFrame[] = [];
	const nameOf = (id: number | null) => (id === null ? 'null' : labels[id - 1]!);

	frames.push({
		items: listSnap(items),
		pointers: { head: 1, prev: null, curr: 1, next: 2 },
		note: '反转单链表：迭代三指针。curr 逐个右移，每走一步把 curr.next 调头指向 prev（下方弧线），prev 跟进。prev 初始为 null（左侧 NULL 桩）。',
	});

	let prev: number | null = null;
	let curr: number | null = 1;
	const locked: number[] = [];
	while (curr !== null) {
		const nxt = items.find((it) => it.id === curr)!.next;
		frames.push({
			items: listSnap(items),
			active: [curr],
			locked: [...locked],
			pointers: { prev, curr, next: nxt },
			note: `处理节点 ${nameOf(curr)}：先记住 next = ${nameOf(nxt)}，否则反转后链就断了`,
		});
		setNext(items, curr, prev);
		frames.push({
			items: listSnap(items),
			active: [curr],
			locked: [...locked],
			pointers: { prev, curr },
			note: `调头：${nameOf(curr)}.next 指向 prev（${nameOf(prev)}），箭头反向（下方虚线弧）`,
		});
		locked.push(curr);
		prev = curr;
		curr = nxt;
		frames.push({
			items: listSnap(items),
			locked: [...locked],
			pointers: { prev, curr, ...(curr !== null ? { next: items.find((it) => it.id === curr)!.next } : {}) },
			note: `prev 前进到 ${nameOf(prev)}，curr 前进到 ${nameOf(curr)}`,
		});
	}
	frames.push({
		items: listSnap(items),
		locked: [...locked],
		pointers: { head: prev },
		note: `curr 为 null，遍历结束：head = prev = ${nameOf(prev)}。整条链已经反向：5 → 4 → 3 → 2 → 1 → null`,
	});
	return { title: '反转链表 · 三指针迭代', frames };
}

/** 环形链表：Floyd 快慢指针判环 + 相遇后找环入口 */
function cycleDetectionDemo(): ListVizConfig {
	const labels = ['1', '2', '3', '4', '5'];
	const n = labels.length;
	const items = labels.map((label, i) => ({ id: i + 1, label, next: i + 1 < n ? i + 2 : 2 })); // 尾节点 5 指回 2
	const frames: ListFrame[] = [];
	const labelOf = (id: number) => labels[id - 1]!;

	frames.push({
		items: listSnap(items),
		pointers: { head: 1, slow: 1, fast: 1 },
		note: '环形链表：尾节点 5 不指向 null，而是指回节点 2（下方虚线回环弧）。判断是否有环：快慢指针同起点出发，slow 每次走 1 步、fast 每次走 2 步——有环则 fast 会绕圈追上 slow 相遇；无环则 fast 先到 null。',
	});

	let slow = 1;
	let fast = 1;
	const stepTo = (id: number): number => items.find((it) => it.id === id)!.next ?? 1;
	let met = false;
	while (!met) {
		slow = stepTo(slow);
		fast = stepTo(stepTo(fast));
		met = slow === fast;
		frames.push({
			items: listSnap(items),
			active: met ? [slow] : [slow, fast],
			pointers: { slow, fast },
			note: met
				? `slow 到 ${labelOf(slow)}、fast 到 ${labelOf(fast)}：相遇了！fast 多走的路程恰好是环长的整数倍——只有环里才会追上，证毕有环`
				: `slow 走 1 步到 ${labelOf(slow)}，fast 走 2 步到 ${labelOf(fast)}，继续`,
		});
	}

	frames.push({
		items: listSnap(items),
		active: [slow],
		pointers: { slow: 1, fast },
		note: '找环入口：slow 回到头节点 1，fast 留在相遇点，两者改为同速各走 1 步，再次相遇的位置就是环入口（数学推导见笔记）',
	});
	slow = 1;
	for (;;) {
		if (slow === fast) break;
		slow = stepTo(slow);
		fast = stepTo(fast);
		frames.push({
			items: listSnap(items),
			active: [slow, fast],
			pointers: { slow, fast },
			note: `slow 到 ${labelOf(slow)}，fast 到 ${labelOf(fast)}`,
		});
	}
	frames.push({
		items: listSnap(items),
		locked: [slow],
		pointers: { 入口: slow },
		note: `再次相遇在节点 ${labelOf(slow)}：正是环的入口（尾节点 5 指回的位置）。全程两趟扫描，O(n) 时间 O(1) 空间`,
	});
	return { title: '环形链表 · 快慢指针判环与找入口', frames };
}

/** 合并两个有序链表：双指针取小者接线，金色结果链逐步长出 */
function mergeListsDemo(): ListVizConfig {
	// 位置 0-2 是 A 链（1,3,5），位置 3-5 是 B 链（2,4,6）
	const items: ListNodeItem[] = [
		{ id: 1, label: '1', next: 2 },
		{ id: 2, label: '3', next: 3 },
		{ id: 3, label: '5', next: null },
		{ id: 4, label: '2', next: 5 },
		{ id: 5, label: '4', next: 6 },
		{ id: 6, label: '6', next: null },
	];
	const labelOf = (id: number) => items.find((it) => it.id === id)!.label;
	const frames: ListFrame[] = [];
	const result: number[] = [];

	frames.push({
		items: listSnap(items),
		pointers: { l1: 1, l2: 4 },
		note: '合并两个有序链表 A（1→3→5，左三格）与 B（2→4→6，右三格）：比较两链头部，较小者接到结果链尾（金色箭头），对应指针前进。',
	});

	let l1: number | null = 1;
	let l2: number | null = 4;
	let tail: number | null = null;
	while (l1 !== null || l2 !== null) {
		let take: number;
		if (l1 === null) take = l2!;
		else if (l2 === null) take = l1;
		else take = Number(labelOf(l1)) <= Number(labelOf(l2)) ? l1 : l2;
		if (tail !== null) setNext(items, tail, take);
		result.push(take);
		if (take === l1) l1 = items.find((it) => it.id === l1)!.next;
		else l2 = items.find((it) => it.id === l2)!.next;
		tail = take;
		frames.push({
			items: listSnap(items),
			active: [take],
			resultNodes: [...result],
			pointers: { ...(l1 !== null ? { l1 } : {}), ...(l2 !== null ? { l2 } : {}) },
			note:
				l1 === null && l2 === null
					? `两条链都已取完，结果链成形`
					: `${labelOf(tail)} 接上结果链（金色）${
							l1 === null
								? '：A 链已取完，之后 B 剩余元素直接整体接上'
								: l2 === null
									? '：B 链已取完，A 剩余元素直接整体接上'
									: l1 !== null && l2 !== null
										? `：比较 ${labelOf(l1)} 与 ${labelOf(l2)}，取较小者`
										: ''
						}`,
		});
	}
	frames.push({
		items: listSnap(items),
		locked: [...result],
		resultNodes: [...result],
		note: '合并完成：金色链 1 → 2 → 3 → 4 → 5 → 6 → null。每个节点只被碰一次，O(m + n)；迭代版只用常数个指针变量',
	});
	return { title: '合并两个有序链表 · 双指针接线', frames };
}

export const listDemos: Record<string, ListVizConfig> = {
	'reverse-list': reverseListDemo(),
	'cycle-detection': cycleDetectionDemo(),
	'merge-lists': mergeListsDemo(),
};

// ===== 栈与队列 =====

/** 有效的括号：左括号入栈、右括号弹栈顶配对；两幕分别为成功与失败用例 */
function validParenthesesDemo(): StackVizConfig {
	const frames: StackFrame[] = [];
	let uid = 0;

	frames.push({
		stacks: [{ label: '括号栈', items: [] }],
		scan: { chars: ['{', '[', '(', ')', ']', '}'], pos: null },
		note: '括号匹配：扫描到左括号就入栈；扫描到右括号就弹出栈顶比对——必须恰好是同种左括号。失败有三种：弹出不匹配、栈空还要弹、扫完栈非空。第一幕先看合法串 { [ ( ) ] }。',
	});

	const run = (chars: string[], okNote: string) => {
		const stack: StackSpec = { label: '括号栈', items: [] };
		for (let i = 0; i < chars.length; i++) {
			const ch = chars[i]!;
			if (ch === '(' || ch === '[' || ch === '{') {
				const item = { id: ++uid, label: ch };
				stack.items.push(item);
				frames.push({
					stacks: [{ ...stack, items: [...stack.items] }],
					active: [item.id],
					scan: { chars, pos: i },
					note: `「${ch}」是左括号：入栈，等待同种右括号来配对`,
				});
			} else {
				const pair = ch === ')' ? '(' : ch === ']' ? '[' : '{';
				const top = stack.items[stack.items.length - 1];
				if (!top || top.label !== pair) {
					frames.push({
						stacks: [{ ...stack, items: [...stack.items] }],
						active: top ? [top.id] : [],
						scan: { chars, pos: i },
						note: top
							? `「${ch}」是右括号：弹出的栈顶是「${top.label}」，与「${pair}」不匹配 —— 直接判定非法`
							: `「${ch}」是右括号但栈是空的：没有任何左括号等它配对 —— 非法`,
					});
					return false;
				}
				stack.items.pop();
				frames.push({
					stacks: [{ ...stack, items: [...stack.items] }],
					scan: { chars, pos: i },
					note: `「${ch}」是右括号：弹出栈顶「${pair}」，恰好同种，配对成功`,
				});
			}
		}
		frames.push({
			stacks: [{ ...stack, items: [...stack.items] }],
			scan: { chars, pos: null },
			note: okNote,
		});
		return true;
	};

	run(['{', '[', '(', ')', ']', '}'], '扫描结束且栈恰好为空 —— 合法。第二幕看一个非法串 { [ ( ] ) }：]');
	run(['{', '[', '(', ']', ')', '}'], '匹配失败（栈里还剩 { 和 [ 没配对，这里不再继续）。核心口诀：最近的左括号最先被配对 —— 这正是栈「后进先出」的性质');
	return { title: '有效的括号 · 栈配对', frames };
}

/** 最小栈：主栈旁并排一个最小栈，getMin 只需看最小栈顶 */
function minStackDemo(): StackVizConfig {
	const frames: StackFrame[] = [];
	const main: StackSpec = { label: '主栈', items: [] };
	const min: StackSpec = { label: '最小栈', items: [] };
	let uid = 0;

	frames.push({
		stacks: [main, min],
		note: '最小栈：push/pop/getMin 都要 O(1)。诀窍是再开一个「最小栈」，与主栈同步压入：每次 push(x) 时把 min(x, 当前最小栈顶) 也压进去；pop 时两栈同弹，最小值永远在最小栈顶端。',
	});

	const ops: Array<{ op: 'push' | 'pop'; v?: number }> = [
		{ op: 'push', v: 5 },
		{ op: 'push', v: 2 },
		{ op: 'push', v: 4 },
		{ op: 'push', v: 1 },
		{ op: 'pop' },
		{ op: 'pop' },
		{ op: 'pop' },
	];
	for (const { op, v } of ops) {
		if (op === 'push') {
			const curMin = min.items.length === 0 ? v! : Math.min(v!, Number(min.items[min.items.length - 1]!.label));
			const a = { id: ++uid, label: String(v) };
			const b = { id: ++uid, label: String(curMin) };
			main.items.push(a);
			min.items.push(b);
			frames.push({
				stacks: [
					{ ...main, items: [...main.items] },
					{ ...min, items: [...min.items] },
				],
				active: [a.id, b.id],
				note: `push(${v})：主栈压入 ${v}；${v} 与最小栈顶 ${min.items.length > 1 ? min.items[min.items.length - 2]!.label : '空'} 比较，压入较小者 ${curMin}。当前 getMin() = ${curMin}`,
			});
		} else {
			const a = main.items.pop()!;
			const b = min.items.pop()!;
			frames.push({
				stacks: [
					{ ...main, items: [...main.items] },
					{ ...min, items: [...min.items] },
				],
				active: [
					...(main.items.length ? [main.items[main.items.length - 1]!.id] : []),
					...(min.items.length ? [min.items[min.items.length - 1]!.id] : []),
				],
				note: `pop()：主栈弹出 ${a.label}，最小栈同步弹出 ${b.label}（它只属于已经离开的元素）。当前 getMin() = ${min.items.length ? min.items[min.items.length - 1]!.label : '空栈'}`,
			});
		}
	}
	frames.push({
		stacks: [
			{ ...main, items: [...main.items] },
			{ ...min, items: [...min.items] },
		],
		note: '全程 push/pop/getMin 都是 O(1)：两个栈各自操作一次。空间换时间的标准范例（另一种解法是「差值法」单栈，可读性差一些）',
	});
	return { title: '最小栈 · 辅助栈同步压最小值', frames };
}

/** 双栈实现队列：入队进 in 栈，出队时 out 栈空才把 in 栈整体倒过去 */
function queueViaStacksDemo(): StackVizConfig {
	const frames: StackFrame[] = [];
	const inStack: StackSpec = { label: 'in 栈（入队）', items: [] };
	const outStack: StackSpec = { label: 'out 栈（出队）', items: [] };
	let uid = 0;

	const snap = (): StackFrame['stacks'] => [
		{ ...inStack, items: [...inStack.items] },
		{ ...outStack, items: [...outStack.items] },
	];

	frames.push({
		stacks: snap(),
		note: '用两个栈实现队列：栈是后进先出，队列要先进先出——用「负负得正」抵消。入队一律压 in 栈；出队时若 out 栈为空，先把 in 栈全部弹出压入 out 栈（顺序恰好反转一次），再从 out 栈弹出。',
	});

	const push = (v: number) => {
		const item = { id: ++uid, label: String(v) };
		inStack.items.push(item);
		frames.push({ stacks: snap(), active: [item.id], note: `入队 ${v}：直接压入 in 栈顶端` });
	};
	const transfer = () => {
		while (inStack.items.length > 0) {
			const item = inStack.items.pop()!;
			outStack.items.push(item);
			frames.push({ stacks: snap(), active: [item.id], note: `out 栈为空：把 in 栈顶的 ${item.label} 弹出、压入 out 栈——每倒一次，顺序反转一次` });
		}
	};
	const pop = () => {
		if (outStack.items.length === 0) transfer();
		const item = outStack.items.pop()!;
		const newTop = outStack.items[outStack.items.length - 1];
		frames.push({
			stacks: snap(),
			active: newTop ? [newTop.id] : [],
			note: `出队：从 out 栈弹出 ${item.label} —— 它是最早入队的元素，先进先出达成`,
		});
		return item.label;
	};

	push(1);
	push(2);
	push(3);
	frames.push({ stacks: snap(), note: '连入队 1、2、3：in 栈顶是 3。此时想出队，out 栈是空的 —— 触发整体倒栈' });
	pop();
	push(4);
	pop();
	pop();
	pop();
	frames.push({ stacks: snap(), note: '结束。均摊分析：每个元素至多被压入两次、弹出两次（in 一进一出、out 一进一出），n 个操作总代价 O(n)，单次均摊 O(1)' });
	return { title: '双栈实现队列 · 负负得正', frames };
}

/** 子集：每个元素「选 / 不选」二叉决策，回溯 = 探路 + 撤销，栈列就是当前路径 */
function subsetsDemo(): StackVizConfig {
	const elems = ['1', '2', '3'];
	const frames: StackFrame[] = [];
	const path: Array<{ id: number; label: string }> = [];
	let uid = 0;
	let found = 0;

	const push = (label: string) => {
		const item = { id: ++uid, label };
		path.push(item);
		frames.push({
			stacks: [{ label: '当前路径', items: [...path] }],
			active: [item.id],
			scan: { chars: elems, pos: path.length - 1 },
			note: `决策「${label}」：走「选」分支 → 路径压入 ${label}`,
		});
	};
	const pop = (who: string, reason: string) => {
		const item = path.pop()!;
		frames.push({
			stacks: [{ label: '当前路径', items: [...path] }],
			scan: { chars: elems, pos: path.length },
			note: `回溯：撤销「${item.label}」（${reason}）。回溯的核心 = 递归到底后把状态恢复成进入前的样子`,
		});
	};
	const record = () => {
		found++;
		frames.push({
			stacks: [{ label: '当前路径', items: [...path] }],
			scan: { chars: elems, pos: elems.length },
			note: `到达决策链末端：收集子集 { ${path.map((p) => p.label).join(', ') || '空'} }（第 ${found} 个）`,
		});
	};

	frames.push({
		stacks: [{ label: '当前路径', items: [] }],
		scan: { chars: elems, pos: 0 },
		note: '子集问题：每个元素都有「选 / 不选」两种决策，n 个元素共 2ⁿ 个子集。橙色扫描条指向当前决策位，竖直栈列是「已选元素路径」——回溯算法 = 递归探路 + 到底收集 + 撤销换分支',
	});

	push('1');
	push('2');
	push('3');
	record();
	pop('3', '3 的两种决策都试完了');
	frames.push({
		stacks: [{ label: '当前路径', items: [...path] }],
		scan: { chars: elems, pos: elems.length },
		note: '「不选 3」也是一条完整路径：收集子集 { 1, 2 }（第 2 个）——不必真的弹出再压入，决策本身就包含两个分支',
	});
	pop('2', '2 的「选」分支已穷尽');
	push('3');
	record();
	pop('3', '3 穷尽');
	frames.push({
		stacks: [{ label: '当前路径', items: [...path] }],
		scan: { chars: elems, pos: elems.length },
		note: '收集 { 1 }（第 4 个）',
	});
	pop('1', '1 的「选」分支已穷尽');
	push('2');
	push('3');
	record();
	pop('3', '3 穷尽');
	frames.push({
		stacks: [{ label: '当前路径', items: [...path] }],
		scan: { chars: elems, pos: elems.length },
		note: '收集 { 2 }（第 5 个）',
	});
	pop('2', '2 穷尽');
	push('3');
	record();
	pop('3', '3 穷尽');
	frames.push({
		stacks: [{ label: '当前路径', items: [...path] }],
		scan: { chars: elems, pos: null },
		note: '收集 { 3 }（第 6 个）。还剩 { 1, 3 }、空集 ∅ 两条分支同理——2³ = 8 个子集全部由这棵决策树给出，时间 O(2ⁿ · n)',
	});
	frames.push({
		stacks: [{ label: '当前路径', items: [] }],
		scan: { chars: elems, pos: null },
		note: '决策树走完。记住骨架：每层做一个决策 → 递归下一层 → 撤销本层决策，「路径 + 撤销」就是回溯的全部',
	});
	return { title: '子集 · 二叉决策回溯', frames };
}

/** 全排列：每层从没用过的元素里选一个，路径栈顶到底即一个排列 */
function permutationsDemo(): StackVizConfig {
	const elems = ['1', '2', '3'];
	const frames: StackVizConfig['frames'] = [];
	const path: Array<{ id: number; label: string }> = [];
	let uid = 0;
	let found = 0;

	const push = (label: string, why: string) => {
		const item = { id: ++uid, label };
		path.push(item);
		frames.push({
			stacks: [{ label: '当前排列', items: [...path] }],
			active: [item.id],
			scan: { chars: elems, pos: path.length - 1 },
			note: `第 ${path.length} 位选 ${label}（${why}）`,
		});
	};
	const pop = (why: string) => {
		const item = path.pop()!;
		frames.push({
			stacks: [{ label: '当前排列', items: [...path] }],
			scan: { chars: elems, pos: path.length },
			note: `撤销 ${item.label}：${why}`,
		});
	};
	const record = () => {
		found++;
		frames.push({
			stacks: [{ label: '当前排列', items: [...path] }],
			scan: { chars: elems, pos: elems.length },
			note: `排列完成：${path.map((p) => p.label).join(' ')}（第 ${found} 个）`,
		});
	};

	frames.push({
		stacks: [{ label: '当前排列', items: [] }],
		scan: { chars: elems, pos: 0 },
		note: '全排列：每一位从「还没用过的元素」里选一个。和子集的区别：每层的候选集会因前面用掉而收缩，路径长度到 n 就收集答案',
	});

	push('1', '首位三个候选 1/2/3，按序尝试');
	push('2', '1 已用');
	push('3', '只剩 3');
	record();
	pop('3 已穷尽');
	pop('第二位候选也穷尽');
	push('3', '1 已用，试 3');
	push('2', '只剩 2');
	record();
	pop('2 已穷尽');
	pop('3 已穷尽');
	pop('1 的全部分支完成');
	push('2', '首位轮到 2');
	push('1', '2 已用');
	push('3', '只剩 3');
	record();
	pop('3 穷尽');
	pop('1 穷尽');
	frames.push({
		stacks: [{ label: '当前排列', items: [...path] }],
		scan: { chars: elems, pos: null },
		note: '按同一骨架继续：2 3 1 → 3 1 2 → 3 2 1，共 3! = 6 个排列。时间 O(n · n!)——回溯的复杂度都由「解的数量 × 每个解的构造代价」决定',
	});
	return { title: '全排列 · used 候选收缩', frames };
}

export const stackDemos: Record<string, StackVizConfig> = {
	'valid-parentheses': validParenthesesDemo(),
	'min-stack': minStackDemo(),
	'queue-via-stacks': queueViaStacksDemo(),
	'subsets': subsetsDemo(),
	'permutations': permutationsDemo(),
};

// ===== 二叉树 =====

const treeSnap = (items: TreeNodeItem[]): TreeNodeItem[] => items.map((it) => ({ ...it }));

/** 二叉树遍历：同一棵树的四种顺序 —— 前序 / 中序 / 后序 / 层序（带队列条） */
function treeTraversalDemo(): TreeVizConfig {
	//          1
	//        /   \
	//       2     3
	//      / \   / \
	//     4   5 6   7
	const items: TreeNodeItem[] = [
		{ id: 1, label: '1', left: 2, right: 3 },
		{ id: 2, label: '2', left: 4, right: 5 },
		{ id: 3, label: '3', left: 6, right: 7 },
		{ id: 4, label: '4', left: null, right: null },
		{ id: 5, label: '5', left: null, right: null },
		{ id: 6, label: '6', left: null, right: null },
		{ id: 7, label: '7', left: null, right: null },
	];
	const labelOf = (id: number): string => items.find((it) => it.id === id)!.label;
	const frames: TreeFrame[] = [];

	frames.push({
		items: treeSnap(items),
		root: 1,
		note: '同一棵二叉树，四种遍历只差一件事：「访问根节点」的时机。前序 = 根左右，中序 = 左根右，后序 = 左右根（都是深度优先，沿左链一路扎到底再回溯）；层序 = 一层一层宽搜。下面依次播放四种顺序，橙色是当前访问节点，灰色是已访问。',
	});

	const runDfs = (name: string, seq: number[]) => {
		frames.push({
			items: treeSnap(items),
			root: 1,
			note: `【${name}】开始：${name === '前序' ? '到达节点立刻访问' : name === '中序' ? '左子树访问完才轮到自己' : '左右子树都访问完才轮到自己'}`,
		});
		const visited: number[] = [];
		const out: string[] = [];
		for (const id of seq) {
			visited.push(id);
			out.push(labelOf(id));
			frames.push({
				items: treeSnap(items),
				root: 1,
				active: [id],
				visited: [...visited],
				note: `${name}访问 ${labelOf(id)}，输出序列：${out.join(' → ')}`,
			});
		}
	};

	runDfs('前序', [1, 2, 4, 5, 3, 6, 7]);
	runDfs('中序', [4, 2, 5, 1, 6, 3, 7]);
	runDfs('后序', [4, 5, 2, 6, 7, 3, 1]);

	// 层序：队列逐层出队，子节点入队
	frames.push({
		items: treeSnap(items),
		root: 1,
		queue: [1],
		note: '【层序】开始：根节点入队（下方队列条，队头高亮）。每步：队头出队并访问，再把它的左右孩子依次入队——队列天然保证一层处理完才轮到下一层',
	});
	const visited: number[] = [];
	const out: string[] = [];
	const queue: number[] = [1];
	while (queue.length > 0) {
		const id = queue.shift()!;
		visited.push(id);
		out.push(labelOf(id));
		const node = items.find((it) => it.id === id)!;
		if (node.left !== null) queue.push(node.left);
		if (node.right !== null) queue.push(node.right);
		frames.push({
			items: treeSnap(items),
			root: 1,
			active: [id],
			visited: [...visited],
			queue: [...queue],
			note: `${labelOf(id)} 出队访问${node.left !== null || node.right !== null ? `，孩子 ${[node.left, node.right].filter((c) => c !== null).map((c) => labelOf(c!)).join('、')} 入队` : '（叶子无孩子入队）'}。输出：${out.join(' → ')}`,
		});
	}
	frames.push({
		items: treeSnap(items),
		root: 1,
		visited: [...visited],
		queue: [],
		note: '队列为空，层序结束：1 → 2 → 3 → 4 → 5 → 6 → 7，正好按层输出。深度优先一条路走到黑（递归/显式栈），广度优先靠队列分层',
	});
	return { title: '二叉树遍历 · 前中后序与层序', frames };
}

/** 二叉搜索树：查找走单边路径 + 中序遍历恰为升序 */
function bstDemo(): TreeVizConfig {
	//            8
	//          /   \
	//         3     10
	//        / \      \
	//       1   6      14
	//          / \    /
	//         4   7  13
	const items: TreeNodeItem[] = [
		{ id: 8, label: '8', left: 3, right: 10 },
		{ id: 3, label: '3', left: 1, right: 6 },
		{ id: 10, label: '10', left: null, right: 14 },
		{ id: 1, label: '1', left: null, right: null },
		{ id: 6, label: '6', left: 4, right: 7 },
		{ id: 14, label: '14', left: 13, right: null },
		{ id: 4, label: '4', left: null, right: null },
		{ id: 7, label: '7', left: null, right: null },
		{ id: 13, label: '13', left: null, right: null },
	];
	const labelOf = (id: number): string => items.find((it) => it.id === id)!.label;
	const frames: TreeFrame[] = [];

	frames.push({
		items: treeSnap(items),
		root: 8,
		note: '二叉搜索树（BST）：左子树全部 < 根 < 右子树全部（对每个节点递归成立）。这个性质让「查找」变成每层二选一：目标比节点小走左边、大走右边。',
	});

	const search = (target: number) => {
		frames.push({
			items: treeSnap(items),
			root: 8,
			note: `查找 ${target}：从根 8 出发，每层只走一条边`,
		});
		const path: number[] = [];
		let cur: number | null = 8;
		while (cur !== null) {
			path.push(cur);
			const v = Number(labelOf(cur));
			if (v === target) {
				frames.push({
					items: treeSnap(items),
					root: 8,
					active: [cur],
					visited: path.filter((p) => p !== cur),
					note: `到达 ${target}，命中！路径 ${path.map(labelOf).join(' → ')}，只看了 ${path.length} 个节点（树平衡时约 log₂n 个）`,
				});
				return;
			}
			const next = items.find((it) => it.id === cur)!;
			const goLeft = target < v;
			frames.push({
				items: treeSnap(items),
				root: 8,
				active: [cur],
				visited: path.filter((p) => p !== cur),
				note: `${target} ${target < v ? '<' : '>'} ${v}：走${goLeft ? '左' : '右'}边`,
			});
			cur = goLeft ? next.left : next.right;
		}
	};

	search(4);
	search(13);

	// 中序遍历：升序输出
	frames.push({
		items: treeSnap(items),
		root: 8,
		note: 'BST 的重要性质：中序遍历（左根右）的输出恰是升序序列——「左 < 根 < 右」逐节点累加起来就是全局有序。中序走一遍：',
	});
	const visited: number[] = [];
	const out: string[] = [];
	const inorder: number[] = [];
	const collect = (id: number | null) => {
		if (id === null) return;
		const node = items.find((it) => it.id === id)!;
		collect(node.left);
		inorder.push(id);
		collect(node.right);
	};
	collect(8);
	for (const id of inorder) {
		visited.push(id);
		out.push(labelOf(id));
		frames.push({
			items: treeSnap(items),
			root: 8,
			active: [id],
			visited: [...visited],
			note: `中序访问 ${labelOf(id)}，输出：${out.join(' → ')}`,
		});
	}
	frames.push({
		items: treeSnap(items),
		root: 8,
		visited: [...visited],
		note: '中序输出 1 → 3 → 4 → 6 → 7 → 8 → 10 → 13 → 14：完全升序。「BST 中序 = 有序数组」是验证 BST、找第 K 小、范围查询等题的共同钥匙',
	});
	return { title: '二叉搜索树 · 查找与中序有序性', frames };
}

/** 翻转二叉树：递归交换每个节点的左右子树，布局随结构逐层镜像 */
function invertTreeDemo(): TreeVizConfig {
	const items: TreeNodeItem[] = [
		{ id: 1, label: '1', left: 2, right: 3 },
		{ id: 2, label: '2', left: 4, right: 5 },
		{ id: 3, label: '3', left: 6, right: 7 },
		{ id: 4, label: '4', left: null, right: null },
		{ id: 5, label: '5', left: null, right: null },
		{ id: 6, label: '6', left: null, right: null },
		{ id: 7, label: '7', left: null, right: null },
	];
	const frames: TreeFrame[] = [];
	const swap = (id: number) => {
		const node = items.find((it) => it.id === id)!;
		[node.left, node.right] = [node.right, node.left];
	};

	frames.push({
		items: treeSnap(items),
		root: 1,
		note: '翻转二叉树（LC 226）：把每个节点的左右子树互换。递归框架与遍历完全相同，只是「访问时做的事」换成交换——注意树形布局随结构重算，交换一发生整棵树就开始镜像',
	});
	swap(1);
	frames.push({
		items: treeSnap(items),
		root: 1,
		active: [1],
		note: 'swap(1)：根的孩子 2、3 互换，左右子树整体对调',
	});
	swap(2);
	frames.push({
		items: treeSnap(items),
		root: 1,
		active: [2],
		visited: [1],
		note: '递归左半：swap(2)，4、5 互换',
	});
	swap(3);
	frames.push({
		items: treeSnap(items),
		root: 1,
		active: [3],
		visited: [1, 2],
		note: '递归右半：swap(3)，6、7 互换',
	});
	frames.push({
		items: treeSnap(items),
		root: 1,
		visited: [1, 2, 3, 4, 5, 6, 7],
		note: '叶子左右皆 null，交换无效果（递归边界）。镜像完成——中序序列从 4 2 5 1 6 3 7 变为 7 3 6 1 5 2 4，恰好整体反转',
	});
	return { title: '翻转二叉树 · 镜像交换', frames };
}

export const treeDemos: Record<string, TreeVizConfig> = {
	'tree-traversal': treeTraversalDemo(),
	'bst-operations': bstDemo(),
	'invert-tree': invertTreeDemo(),
};
