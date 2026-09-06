import type { VizConfig, VizFrame, VizItem } from '../../components/viz/AlgorithmViz';

const toItems = (values: number[]): VizItem[] => values.map((value, id) => ({ id, value }));

/** 冒泡排序：每轮把未区间的最大值冒泡到末尾，含 swapped 提前退出 */
function bubbleSortDemo(): VizConfig {
	const values = [8, 3, 9, 2, 6, 1, 5];
	const arr = toItems(values);
	const n = arr.length;
	const frames: VizFrame[] = [];
	const locked: number[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));

	frames.push({
		items: snap(),
		note: `初始数组（${n} 个元素）。冒泡排序每轮从左到右两两比较相邻元素，逆序就交换，把最大值「冒泡」到末尾。`,
	});

	for (let i = 0; i < n - 1; i++) {
		let swapped = false;
		for (let j = 0; j < n - 1 - i; j++) {
			const a = arr[j]!;
			const b = arr[j + 1]!;
			frames.push({
				items: snap(),
				active: [j, j + 1],
				locked: [...locked],
				pointers: { j, 'j+1': j + 1 },
				note: `比较相邻的 ${a.value} 和 ${b.value}：${a.value > b.value ? '前者更大，逆序，需要交换' : '顺序正确，保持不动'}`,
			});
			if (a.value > b.value) {
				arr[j] = b;
				arr[j + 1] = a;
				swapped = true;
				frames.push({
					items: snap(),
					active: [j, j + 1],
					locked: [...locked],
					pointers: { j, 'j+1': j + 1 },
					note: `${a.value} > ${b.value}，交换两者，较大的 ${a.value} 向右冒一位`,
				});
			}
		}
		locked.unshift(n - 1 - i);
		frames.push({
			items: snap(),
			locked: [...locked],
			note: `第 ${i + 1} 轮结束：${arr[n - 1 - i]!.value} 已在最终位置，无序区间缩短一格（灰色柱已就位）`,
		});
		if (!swapped) {
			for (let k = 0; k < n; k++) if (!locked.includes(k)) locked.push(k);
			frames.push({ items: snap(), locked: [...locked], note: '本轮没有任何交换，说明数组已经整体有序，提前退出' });
			break;
		}
	}
	locked.push(0);
	frames.push({ items: snap(), locked: [...locked], note: '排序完成：所有元素都在最终位置' });
	return { title: '冒泡排序 · 相邻比较与交换', frames };
}

/** 快速排序：Lomuto 分区 + 递归，展示基准归位与左右区间划分 */
function quickSortDemo(): VizConfig {
	const values = [7, 3, 8, 2, 9, 1, 5];
	const arr = toItems(values);
	const n = arr.length;
	const locked = new Set<number>();
	const frames: VizFrame[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));
	const lockedArr = () => [...locked].sort((a, b) => a - b);

	function partition(low: number, high: number): number {
		const pivot = arr[high]!.value;
		frames.push({
			items: snap(),
			active: [high],
			locked: lockedArr(),
			pointers: { low, high, 基准: high },
			note: `处理区间 [${low}, ${high}]：取末尾元素 ${pivot} 作为基准（Lomuto 分区），目标：左边都 < 基准，右边都 ≥ 基准`,
		});
		let i = low;
		for (let j = low; j < high; j++) {
			const cur = arr[j]!.value;
			frames.push({
				items: snap(),
				active: [j],
				locked: lockedArr(),
				pointers: { i, j, 基准: high },
				note: `j 扫到 ${cur}：${cur < pivot ? `小于基准 ${pivot}，应归入左侧` : `不小于基准 ${pivot}，留在右侧，j 继续前进`}`,
			});
			if (cur < pivot) {
				if (i !== j) {
					[arr[i], arr[j]] = [arr[j]!, arr[i]!];
					frames.push({
						items: snap(),
						active: [i, j],
						locked: lockedArr(),
						pointers: { i, j, 基准: high },
						note: `交换 i、j 两个位置，把较小的 ${cur} 换到左侧，随后 i 右移一格`,
					});
				}
				i++;
			}
		}
		if (i !== high) [arr[i], arr[high]] = [arr[high]!, arr[i]!];
		locked.add(i);
		frames.push({
			items: snap(),
			active: [i],
			locked: lockedArr(),
			note: `扫描结束，基准 ${pivot} 与 i 位置交换、归位到下标 ${i}：左侧全部小于它，右侧全部不小于它`,
		});
		return i;
	}

	function sort(low: number, high: number): void {
		if (low > high) return;
		if (low === high) {
			locked.add(low);
			frames.push({
				items: snap(),
				locked: lockedArr(),
				note: `区间 [${low}, ${low}] 只剩一个元素，天然就位`,
			});
			return;
		}
		const p = partition(low, high);
		sort(low, p - 1);
		sort(p + 1, high);
	}

	frames.push({
		items: snap(),
		note: '初始数组。快速排序 = 分治：每次选一个基准做分区（partition），基准归位后左右两个子区间再各自递归。',
	});
	sort(0, n - 1);
	frames.push({ items: snap(), locked: [...Array(n).keys()], note: '排序完成：每个基准都归位后，整个数组有序' });
	return { title: '快速排序 · 分区（partition）与分治', frames };
}

/** 二分查找：在有序数组中定位 target，展示 low / mid / high 的收缩 */
function binarySearchDemo(): VizConfig {
	const values = [2, 5, 8, 12, 16, 23, 38, 56];
	const n = values.length;
	const target = 16;
	const items = toItems(values);
	const frames: VizFrame[] = [];

	let low = 0;
	let high = n - 1;
	let compares = 0;
	frames.push({
		items: [...items],
		pointers: { low, high },
		note: `在有序数组中查找 target = ${target}，初始搜索区间 [${low}, ${high}]。二分的前提：数组有序且支持随机访问。`,
	});

	while (low <= high) {
		const mid = low + ((high - low) >> 1);
		const cur = values[mid]!;
		compares++;
		frames.push({
			items: [...items],
			active: [mid],
			pointers: { low, mid, high },
			note: `取中点 mid = ${mid}，arr[mid] = ${cur}。与 target=${target} 比较：${cur === target ? '正好相等' : cur < target ? '偏小' : '偏大'}`,
		});
		if (cur === target) {
			frames.push({
				items: [...items],
				active: [mid],
				locked: [mid],
				note: `arr[mid] = ${target}，命中！一共只比较了 ${compares} 次（线性查找平均要 ${Math.ceil(n / 2)} 次以上）`,
			});
			return { title: `二分查找 · 在 ${n} 个元素中定位 ${target}`, frames };
		}
		if (cur < target) {
			low = mid + 1;
			frames.push({
				items: [...items],
				pointers: { low, high },
				note: `${cur} < ${target}，目标只可能在右半区：low = mid + 1 = ${low}，区间折半`,
			});
		} else {
			high = mid - 1;
			frames.push({
				items: [...items],
				pointers: { low, high },
				note: `${cur} > ${target}，目标只可能在左半区：high = mid - 1 = ${high}，区间折半`,
			});
		}
	}
	frames.push({ items: [...items], note: `low > high，区间为空，${target} 不在数组中` });
	return { title: `二分查找 · 在 ${n} 个元素中定位 ${target}`, frames };
}

/** 笔记中可通过 <AlgorithmVizIsland demo="..." /> 引用的演示注册表 */
export const vizDemos: Record<string, VizConfig> = {
	'bubble-sort': bubbleSortDemo(),
	'quick-sort': quickSortDemo(),
	'binary-search': binarySearchDemo(),
};
