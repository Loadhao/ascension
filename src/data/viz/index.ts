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

/** 插入排序：抽 key 入有序前缀，比 key 大的元素依次右移（演示用相邻交换等价呈现位移） */
function insertionSortDemo(): VizConfig {
	const arr = toItems([5, 2, 9, 4, 7, 1, 6]);
	const n = arr.length;
	const frames: VizFrame[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));

	frames.push({
		items: snap(),
		note: `初始数组（${n} 个元素）。插入排序像整理手中的扑克牌：左侧维护一段有序前缀，每次抽出下一个元素，在前缀中从右往左找到位置插进去。`,
	});

	for (let i = 1; i < n; i++) {
		const key = arr[i]!.value;
		frames.push({
			items: snap(),
			active: [i],
			pointers: { key: i },
			note: `抽出第 ${i + 1} 个元素 ${key} 作为 key：左侧 [0, ${i - 1}] 已有序，现在为它找插入位置`,
		});
		let j = i;
		while (j > 0 && arr[j - 1]!.value > arr[j]!.value) {
			frames.push({
				items: snap(),
				active: [j - 1, j],
				pointers: { key: j },
				note: `前缀里的 ${arr[j - 1]!.value} > key ${key}，它应该让位：右移一格（演示中呈现为与 key 交换）`,
			});
			[arr[j - 1], arr[j]] = [arr[j]!, arr[j - 1]!];
			frames.push({
				items: snap(),
				active: [j - 1, j],
				pointers: { key: j - 1 },
				note: `${key} 左移一位，继续与前一个元素比较`,
			});
			j--;
		}
		frames.push({
			items: snap(),
			pointers: { key: j },
			note: `前面没有比 ${key} 更大的元素了，key 落在位置 ${j}：前缀 [0, ${i}] 保持有序`,
		});
	}
	frames.push({
		items: snap(),
		locked: [...Array(n).keys()],
		note: '排序完成：前缀扩展到整个数组，全部有序',
	});
	return { title: '插入排序 · 抽牌入位', frames };
}

/** 选择排序：每轮从未排序区间选出最小值，与区间头部交换 */
function selectionSortDemo(): VizConfig {
	const arr = toItems([7, 4, 9, 2, 8, 3, 6]);
	const n = arr.length;
	const frames: VizFrame[] = [];
	const locked: number[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));

	frames.push({
		items: snap(),
		note: `初始数组（${n} 个元素）。选择排序每轮从未排序区间里「选」出最小的元素，与区间头部交换：比较次数固定，交换次数最少。`,
	});

	for (let i = 0; i < n - 1; i++) {
		let min = i;
		frames.push({
			items: snap(),
			locked: [...locked],
			pointers: { min },
			note: `第 ${i + 1} 轮：在 [${i}, ${n - 1}] 里找最小值，先假设头部的 ${arr[i]!.value} 最小`,
		});
		for (let j = i + 1; j < n; j++) {
			frames.push({
				items: snap(),
				active: [j],
				locked: [...locked],
				pointers: { min, j },
				note: `比较 ${arr[j]!.value} 与当前最小 ${arr[min]!.value}：${arr[j]!.value < arr[min]!.value ? `更小，min 改指下标 ${j}` : '不更小，min 不动'}`,
			});
			if (arr[j]!.value < arr[min]!.value) min = j;
		}
		if (min !== i) {
			frames.push({
				items: snap(),
				active: [i, min],
				locked: [...locked],
				pointers: { min },
				note: `本轮最小值 ${arr[min]!.value} 与区间头部 ${arr[i]!.value} 交换`,
			});
			[arr[i], arr[min]] = [arr[min]!, arr[i]!];
		} else {
			frames.push({
				items: snap(),
				active: [i],
				locked: [...locked],
				note: `头部 ${arr[i]!.value} 本来就是最小值，本轮无需交换`,
			});
		}
		locked.push(i);
		frames.push({
			items: snap(),
			locked: [...locked],
			note: `${arr[i]!.value} 归位到位置 ${i}，无序区间缩短一格（灰色柱已就位）`,
		});
	}
	locked.push(n - 1);
	frames.push({
		items: snap(),
		locked: [...locked],
		note: '排序完成：每轮至多一次交换，总交换次数只有 O(n)，是交换次数最少的一类排序',
	});
	return { title: '选择排序 · 每轮选最小放头部', frames };
}

/** 归并排序：递归对半拆到单元素，再两两合并，合并阶段「相等取左」保证稳定 */
function mergeSortDemo(): VizConfig {
	const arr = toItems([6, 3, 8, 5, 2, 7, 4, 1]);
	const n = arr.length;
	const frames: VizFrame[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));

	function merge(low: number, mid: number, high: number): void {
		// 左右半区整体暂存辅助数组；leftPos/rightPos 记录各暂存元素当前显示在哪根柱子上。
		// 写回用「腾位交换」而非直接覆盖：胜者与位置 k 上的待写元素交换，保证任一帧里元素 id 唯一。
		const left = arr.slice(low, mid + 1);
		const right = arr.slice(mid + 1, high + 1);
		const leftPos = left.map((_, idx) => low + idx);
		const rightPos = right.map((_, idx) => mid + 1 + idx);
		frames.push({
			items: snap(),
			active: Array.from({ length: high - low + 1 }, (_, idx) => low + idx),
			pointers: { i: low, j: mid + 1, k: low },
			note: `合并 [${low}, ${mid}] 与 [${mid + 1}, ${high}]：两半各自有序（橙色列），已暂存辅助数组；i、j 指向两半头部，k 是写回位置`,
		});
		let i = 0;
		let j = 0;
		let k = low;
		const headPointers = (): Record<string, number> => ({
			...(i < left.length ? { i: leftPos[i]! } : {}),
			...(j < right.length ? { j: rightPos[j]! } : {}),
			k,
		});
		while (i < left.length || j < right.length) {
			const bothAlive = i < left.length && j < right.length;
			const takeLeft = bothAlive ? left[i]!.value <= right[j]!.value : i < left.length;
			const lv = left[i]?.value;
			const rv = right[j]?.value;
			const src = takeLeft ? left[i]! : right[j]!;
			const srcPos = (takeLeft ? leftPos[i] : rightPos[j])!;
			const displaced = arr[k]!;
			const moved = srcPos !== k;
			arr[k] = src;
			arr[srcPos] = displaced;
			// 被顶替的元素仍是待写状态，更新它的显示位置
			const di = left.indexOf(displaced);
			if (di !== -1) leftPos[di] = srcPos;
			else {
				const dj = right.indexOf(displaced);
				if (dj !== -1) rightPos[dj] = srcPos;
			}
			if (takeLeft) i++;
			else j++;
			const reason = !bothAlive
				? takeLeft
					? `右半已取完，左半剩余的 ${lv} 依次写回位置 ${k}`
					: `左半已取完，右半剩余的 ${rv} 依次写回位置 ${k}`
				: takeLeft
					? `比较头部 ${lv} 与 ${rv}：${lv} ≤ ${rv}，取左半的（相等取左保证稳定），写入位置 ${k}`
					: `比较头部 ${lv} 与 ${rv}：${rv} < ${lv}，取右半的，写入位置 ${k}`;
			frames.push({
				items: snap(),
				active: moved ? [k, srcPos] : [k],
				pointers: headPointers(),
				note: moved ? `${reason}；原来占位的 ${displaced.value} 暂移到位置 ${srcPos}` : reason,
			});
			k++;
		}
		frames.push({ items: snap(), note: `区间 [${low}, ${high}] 合并完成：这一段整体有序` });
	}

	function sort(low: number, high: number): void {
		if (low >= high) return;
		const mid = low + ((high - low) >> 1);
		sort(low, mid);
		sort(mid + 1, high);
		merge(low, mid, high);
	}

	frames.push({
		items: snap(),
		note: '初始数组。归并排序 = 分治：递归对半拆分，拆到单个元素自然有序，再两两有序合并——快排的功夫在分区（先做事后递归），归并的功夫在合并（先递归后做事）。',
	});
	sort(0, n - 1);
	frames.push({
		items: snap(),
		locked: [...Array(n).keys()],
		note: '排序完成：每合并一层区间长度翻倍，共 log₂n 层、每层整体扫一遍 O(n)，任何输入都是稳定的 O(n log n)',
	});
	return { title: '归并排序 · 分治与合并', frames };
}

/** 堆排序：数组即完全二叉树（k 的孩子是 2k+1、2k+2），建大顶堆后逐个取堆顶归位 */
function heapSortDemo(): VizConfig {
	const arr = toItems([4, 9, 3, 7, 2, 8, 6]);
	const n = arr.length;
	const frames: VizFrame[] = [];
	const locked: number[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));

	/** 自顶向下调整：父节点与较大的孩子比较、下沉，恢复「父 ≥ 孩子」的大顶堆性质 */
	function siftDown(start: number, size: number): void {
		let p = start;
		for (;;) {
			const l = 2 * p + 1;
			const r = l + 1;
			if (l >= size) break;
			let big = l;
			if (r < size && arr[r]!.value > arr[l]!.value) big = r;
			const pv = arr[p]!.value;
			const cv = arr[big]!.value;
			frames.push({
				items: snap(),
				active: [p, big],
				locked: [...locked],
				pointers: { 父: p, 大子: big },
				note: `比较父节点 ${pv}（下标 ${p}）与较大孩子 ${cv}（下标 ${big}）：${cv > pv ? '孩子更大，违反堆性质，需要交换下沉' : '父节点不小于孩子，堆性质满足，调整结束'}`,
			});
			if (cv <= pv) break;
			[arr[p], arr[big]] = [arr[big]!, arr[p]!];
			frames.push({
				items: snap(),
				active: [p, big],
				locked: [...locked],
				note: `交换：${cv} 上浮到下标 ${p}，${pv} 沉到下标 ${big}，继续检查 ${pv} 是否还要下沉`,
			});
			p = big;
		}
	}

	frames.push({
		items: snap(),
		note: `初始数组。堆排序把数组看作完全二叉树：下标 k 的孩子是 2k+1 与 2k+2（层序排布，无需指针）。第一阶段：自底向上建大顶堆。`,
	});
	for (let i = (n >> 1) - 1; i >= 0; i--) {
		frames.push({
			items: snap(),
			note: `从最后一个非叶子节点（下标 ${i}）开始向下调整（叶子天然满足堆性质）`,
		});
		siftDown(i, n);
	}
	frames.push({
		items: snap(),
		active: [0],
		note: `大顶堆建成：堆顶（下标 0）就是最大值 ${arr[0]!.value}`,
	});

	for (let end = n - 1; end > 0; end--) {
		frames.push({
			items: snap(),
			active: [0, end],
			note: `堆顶 ${arr[0]!.value} 是无序区的最大值：与无序区末尾（下标 ${end}）交换，让它归位`,
		});
		[arr[0], arr[end]] = [arr[end]!, arr[0]!];
		locked.push(end);
		frames.push({
			items: snap(),
			active: [0],
			locked: [...locked],
			note: `${arr[end]!.value} 已归位（灰色柱），堆大小缩小为 ${end}，交换上来的 ${arr[0]!.value} 从堆顶向下调整恢复堆性质`,
		});
		siftDown(0, end);
	}
	locked.push(0);
	frames.push({
		items: snap(),
		locked: [...locked],
		note: '排序完成：每轮取走堆顶最大值放到无序区末尾，共 n-1 轮，数组升序',
	});
	return { title: '堆排序 · 建堆与取堆顶', frames };
}

/** 对撞双指针：有序数组中找和等于 target 的两个数 */
function twoPointersDemo(): VizConfig {
	const values = [1, 3, 5, 8, 9, 13, 16, 20];
	const target = 18;
	const items = toItems(values);
	const frames: VizFrame[] = [];
	let l = 0;
	let r = values.length - 1;

	frames.push({
		items: [...items],
		pointers: { L: l, R: r },
		note: `在有序数组中找两个数，使和等于 target = ${target}。双指针从两端出发：和小了只能 L 右移（和变大），和大了只能 R 左移（和变小），每一步都排除掉一批不可能的解。`,
	});

	while (l < r) {
		const sum = values[l]! + values[r]!;
		frames.push({
			items: [...items],
			active: [l, r],
			pointers: { L: l, R: r },
			note: `arr[L] + arr[R] = ${values[l]} + ${values[r]} = ${sum}，${sum === target ? '等于 target，命中！' : sum < target ? `小于 ${target}：R 左移只会更小，排除 (L, R) 全部组合，L 右移` : `大于 ${target}：L 右移只会更大，排除 (L, R) 全部组合，R 左移`}`,
		});
		if (sum === target) {
			frames.push({
				items: [...items],
				locked: [l, r],
				note: `找到：下标 ${l}（${values[l]}）+ 下标 ${r}（${values[r]}）= ${target}。两指针各扫一段，总共 O(n)，而枚举所有数对要 O(n²)`,
			});
			return { title: `双指针 · 有序数组两数之和 = ${target}`, frames };
		}
		if (sum < target) l++;
		else r--;
	}
	frames.push({ items: [...items], note: 'L 与 R 相遇，所有组合都被排除，不存在和等于 target 的数对' });
	return { title: `双指针 · 有序数组两数之和 = ${target}`, frames };
}

/** 滑动窗口：正数数组中找「和 ≥ target」的最短连续子数组 */
function slidingWindowDemo(): VizConfig {
	const values = [2, 3, 1, 2, 4, 3];
	const target = 7;
	const items = toItems(values);
	const n = values.length;
	const frames: VizFrame[] = [];
	const winIdx = (l: number, r: number) => Array.from({ length: r - l + 1 }, (_, k) => l + k);
	let l = 0;
	let sum = 0;
	let best: [number, number] | null = null;
	let bestLen = Infinity;

	frames.push({
		items: [...items],
		note: `正数数组中找「和 ≥ ${target}」的最短连续子数组。窗口 [L, R]（橙色列）：和不够就 R 右移吃进新元素，够了就 L 右移吐掉旧元素并记录长度——每个元素至多进出窗口一次，整体 O(n)。`,
	});

	for (let r = 0; r < n; r++) {
		sum += values[r]!;
		frames.push({
			items: [...items],
			active: winIdx(l, r),
			pointers: { L: l, R: r },
			note: `R 右移，吃进 ${values[r]}：窗口 [${l}, ${r}] 的和 = ${sum}${sum < target ? ` < ${target}，还不够，继续扩张` : ` ≥ ${target}，尝试收缩找更短的`}`,
		});
		while (sum >= target) {
			if (r - l + 1 < bestLen) {
				bestLen = r - l + 1;
				best = [l, r];
			}
			frames.push({
				items: [...items],
				active: winIdx(l, r),
				pointers: { L: l, R: r },
				note: `窗口和 ${sum} ≥ ${target}：记录长度 ${r - l + 1}${r - l + 1 <= bestLen ? '（目前最短）' : ''}，吐掉左端 ${values[l]} 看能否更短`,
			});
			sum -= values[l]!;
			l++;
			frames.push({
				items: [...items],
				active: l <= r ? winIdx(l, r) : [],
				pointers: l <= r ? { L: l, R: r } : { R: r },
				note: `L 右移后窗口 [${l}, ${r}] 的和 = ${sum}${sum >= target ? '，仍然够，继续收缩' : `，不够了，回到 R 扩张`}`,
			});
		}
	}
	frames.push({
		items: [...items],
		locked: best ? winIdx(best[0], best[1]) : [],
		note: best
			? `扫描结束：最短的是窗口 [${best[0]}, ${best[1]}]（[${values.slice(best[0], best[1] + 1).join(', ')}]），长度 ${bestLen}，和 ≥ ${target}`
			: '扫描结束：整个数组的和都不够 target，无解',
	});
	return { title: `滑动窗口 · 和 ≥ ${target} 的最短子数组`, frames };
}

/** 希尔排序：gap 从大到小分组插入，远距离先消除逆序，gap=1 时数组已近乎有序 */
function shellSortDemo(): VizConfig {
	const arr = toItems([8, 5, 9, 2, 6, 3, 7, 1]);
	const n = arr.length;
	const frames: VizFrame[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));
	const gaps = [4, 2, 1];

	frames.push({
		items: snap(),
		note: `初始数组（${n} 个元素）。希尔排序是插入排序的推广：按下标间隔 gap 分组做插入排序，gap 从大到小递减——大 gap 一步消除远距离逆序，最后 gap = 1 时数组已近乎有序，插入排序接近 O(n)。`,
	});

	for (const gap of gaps) {
		frames.push({
			items: snap(),
			note: `gap = ${gap}：下标相差 ${gap} 的元素视为一组，组内做插入排序`,
		});
		for (let i = gap; i < n; i++) {
			let j = i;
			while (j >= gap && arr[j - gap]!.value > arr[j]!.value) {
				const front = arr[j - gap]!.value;
				const cur = arr[j]!.value;
				frames.push({
					items: snap(),
					active: [j - gap, j],
					pointers: { i: j, 前: j - gap },
					note: `同组比较相距 ${gap} 的 ${front} 与 ${cur}：${front} > ${cur}，交换（小值一步跨越 ${gap} 格）`,
				});
				[arr[j - gap], arr[j]] = [arr[j]!, arr[j - gap]!];
				frames.push({
					items: snap(),
					active: [j - gap, j],
					pointers: { i: j - gap, 前: j },
					note: `${cur} 前移了 ${gap} 格，继续与同组前一个比较`,
				});
				j -= gap;
			}
		}
		frames.push({
			items: snap(),
			note: `gap = ${gap} 完成：${gap === 1 ? '整个数组有序' : `任意相距 ${gap} 的两个元素之间已有序`}`,
		});
	}
	frames.push({
		items: snap(),
		locked: [...Array(n).keys()],
		note: '排序完成：三层 gap 逐层逼近有序，最后一轮 gap = 1 只做了少量移动',
	});
	return { title: '希尔排序 · 间隔分组插入', frames };
}

/** 计数排序（简化展开版）：阶段一逐个计数，阶段二换一排柱子按计数从左到右还原输出 */
function countingSortDemo(): VizConfig {
	const values = [4, 2, 2, 8, 3, 3, 1];
	const n = values.length;
	const maxV = Math.max(...values);
	const minV = Math.min(...values);
	const frames: VizFrame[] = [];
	const counts = new Map<number, number>();

	frames.push({
		items: [...toItems(values)],
		note: `初始数组：值都是 ${minV} ~ ${maxV} 之间的小整数。计数排序不比较元素大小——先数出每个值出现几次，再按值的顺序直接还原输出，用「值本身当地址」绕开了比较排序 O(n log n) 的下界。`,
	});

	for (let i = 0; i < n; i++) {
		const v = values[i]!;
		counts.set(v, (counts.get(v) ?? 0) + 1);
		const table = [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([val, c]) => `${val}×${c}`).join('，');
		frames.push({
			items: [...toItems(values)],
			active: [i],
			note: `数到值 ${v}：count[${v}] = ${counts.get(v)}。当前计数表：${table}`,
		});
	}

	const out: VizItem[] = values.map((_, i) => ({ id: 100 + i, value: 0 }));
	frames.push({
		items: out.map((it) => ({ ...it })),
		note: '计数完成。下面换一排新柱子表示输出数组：从左到右按值从小到大、每个值写入它的次数（矮柱是尚未写入的位置）',
	});
	let w = 0;
	let skipped: number[] = [];
	const flushSkipped = () => {
		if (skipped.length === 0) return;
		frames.push({
			items: out.map((it) => ({ ...it })),
			locked: [...Array(w).keys()],
			note: `count[${skipped.join('、')}] = 0：这些值没出现过，跳过`,
		});
		skipped = [];
	};
	for (let v = minV; v <= maxV; v++) {
		const c = counts.get(v) ?? 0;
		if (c === 0) {
			skipped.push(v);
			continue;
		}
		flushSkipped();
		for (let m = 0; m < c; m++) out[w + m] = { id: 100 + w + m, value: v };
		frames.push({
			items: out.map((it) => ({ ...it })),
			active: Array.from({ length: c }, (_, k) => w + k),
			locked: [...Array(w).keys()],
			note: `count[${v}] = ${c}：连续写入 ${c} 个 ${v}`,
		});
		w += c;
	}
	flushSkipped();
	frames.push({
		items: out.map((it) => ({ ...it })),
		locked: [...Array(n).keys()],
		note: `还原完成：全程只做了「数一遍 + 写一遍」，耗时 O(n + k)（k 是值的范围），与元素间的比较无关`,
	});
	return { title: '计数排序 · 计数与还原', frames };
}

/** 三路分区（荷兰国旗问题）：一次扫描把数组分成 <、=、> 三段 */
function threeWayPartitionDemo(): VizConfig {
	const arr = toItems([5, 2, 9, 2, 5, 9, 2]);
	const n = arr.length;
	const pivot = 5;
	const frames: VizFrame[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));
	let lt = 0;
	let i = 0;
	let gt = n - 1;

	frames.push({
		items: snap(),
		pointers: { lt, i, gt },
		note: `荷兰国旗问题：以 ${pivot} 为基准，一次扫描把数组分成「< ${pivot}｜= ${pivot}｜> ${pivot}」三段。不变量：lt 左边全部小于基准，gt 右边全部大于，i 负责扫描中间的未知区。`,
	});

	while (i <= gt) {
		const v = arr[i]!.value;
		if (v < pivot) {
			frames.push({
				items: snap(),
				active: [lt, i],
				pointers: { lt, i, gt },
				note: `arr[i] = ${v} < 基准：换到 lt 位置进入「小于」段，随后 lt、i 各右移一格`,
			});
			[arr[lt], arr[i]] = [arr[i]!, arr[lt]!];
			lt++;
			i++;
		} else if (v > pivot) {
			frames.push({
				items: snap(),
				active: [i, gt],
				pointers: { lt, i, gt },
				note: `arr[i] = ${v} > 基准：换到 gt 位置进入「大于」段，gt 左移；i 不动——换过来的元素还没检查过`,
			});
			[arr[i], arr[gt]] = [arr[gt]!, arr[i]!];
			gt--;
		} else {
			frames.push({
				items: snap(),
				active: [i],
				pointers: { lt, i, gt },
				note: `arr[i] = ${v} = 基准：留在中段，i 右移即可`,
			});
			i++;
		}
	}
	frames.push({
		items: snap(),
		locked: [...Array(n).keys()],
		note: `i > gt，未知区清空：[0, ${lt - 1}] 全 < ${pivot}，[${lt}, ${gt}] 全 = ${pivot}（共 ${gt - lt + 1} 个），[${gt + 1}, ${n - 1}] 全 > ${pivot}`,
	});
	return { title: `三路分区 · 荷兰国旗问题（基准 ${pivot}）`, frames };
}

/** 快速选择：借用快排分区找第 K 小，每次只递归包含答案的一侧，平均 O(n) */
function quickSelectDemo(): VizConfig {
	const arr = toItems([7, 3, 8, 2, 9, 1, 5]);
	const n = arr.length;
	const k = 3;
	const frames: VizFrame[] = [];
	const snap = (): VizItem[] => arr.map((it) => ({ ...it }));

	function partition(low: number, high: number): number {
		const pivot = arr[high]!.value;
		frames.push({
			items: snap(),
			active: [high],
			pointers: { low, high, 基准: high },
			note: `在 [${low}, ${high}] 内分区：取末尾 ${pivot} 为基准，让它落到「整体有序时应在的位置」——该位置左侧都不大于它、右侧都不小于它`,
		});
		let i = low;
		for (let j = low; j < high; j++) {
			const cur = arr[j]!.value;
			frames.push({
				items: snap(),
				active: [j],
				pointers: { i, j, 基准: high },
				note: `j 扫到 ${cur}：${cur < pivot ? `小于基准 ${pivot}，归入左侧` : `不小于基准 ${pivot}，留在右侧`}`,
			});
			if (cur < pivot) {
				if (i !== j) {
					[arr[i], arr[j]] = [arr[j]!, arr[i]!];
					frames.push({
						items: snap(),
						active: [i, j],
						pointers: { i, j, 基准: high },
						note: `交换到左侧「小于基准」区，i 右移`,
					});
				}
				i++;
			}
		}
		if (i !== high) [arr[i], arr[high]] = [arr[high]!, arr[i]!];
		frames.push({
			items: snap(),
			active: [i],
			pointers: { k: k - 1 },
			note: `基准 ${pivot} 归位到下标 ${i}，它就是第 ${i + 1} 小。${i === k - 1 ? '正好是目标！' : i < k - 1 ? `第 ${k} 小比它大，答案只可能在右侧 [${i + 1}, ${high}]——左侧整段直接不用管` : `第 ${k} 小比它小，答案只可能在左侧 [${low}, ${i - 1}]——右侧整段直接不用管`}`,
		});
		return i;
	}

	let low = 0;
	let high = n - 1;
	frames.push({
		items: snap(),
		pointers: { k: k - 1 },
		note: `找第 ${k} 小（目标下标 ${k - 1}，k 指针固定标记它）。整体排序要 O(n log n)，快速选择每次分区后只进入「包含答案的那一侧」，另一侧整段丢弃，平均 O(n)。`,
	});
	for (;;) {
		const p = partition(low, high);
		if (p === k - 1) {
			frames.push({
				items: snap(),
				locked: [k - 1],
				note: `找到：第 ${k} 小是 ${arr[k - 1]!.value}。注意数组并没有整体有序——只为一个答案付出了约一次扫描的成本`,
			});
			return { title: `快速选择 · 找第 ${k} 小`, frames };
		}
		if (p < k - 1) low = p + 1;
		else high = p - 1;
	}
}

/** 搜索旋转排序数组：旋转后的有序数组上二分，mid 两侧必有一侧有序 */
function rotatedBinarySearchDemo(): VizConfig {
	const values = [15, 18, 2, 5, 6, 8, 11, 12];
	const target = 2;
	const items = toItems(values);
	const n = values.length;
	const frames: VizFrame[] = [];
	let low = 0;
	let high = n - 1;

	frames.push({
		items: [...items],
		pointers: { low, high },
		note: `数组原本升序、在某个点被旋转过（这里 ${values[2]} 就是旋转点）。找 target = ${target}：二分仍然可用——对任何 mid，[low, mid] 与 [mid, high] 至少有一半是有序的，用有序的那半判断 target 在不在其中。`,
	});

	while (low <= high) {
		const mid = low + ((high - low) >> 1);
		const mv = values[mid]!;
		const leftSorted = values[low]! <= mv;
		let direction = '';
		if (mv === target) {
			direction = `正好等于 target，命中！`;
		} else if (leftSorted) {
			const inLeft = values[low]! <= target && target < mv;
			direction = `左半 [${low}, ${mid}] 有序（${values[low]}…${mv}）：${inLeft ? `target 在其中，去左半：high = mid - 1 = ${mid - 1}` : `target 不在有序左半，只能去右半：low = mid + 1 = ${mid + 1}`}`;
		} else {
			const inRight = mv < target && target <= values[high]!;
			direction = `右半 [${mid}, ${high}] 有序（${mv}…${values[high]}）：${inRight ? `target 在其中，去右半：low = mid + 1 = ${mid + 1}` : `target 不在有序右半，只能去左半：high = mid - 1 = ${mid - 1}`}`;
		}
		frames.push({
			items: [...items],
			active: [mid],
			pointers: { low, mid, high },
			note: `mid = ${mid}，值 ${mv}。${direction}`,
		});
		if (mv === target) {
			frames.push({
				items: [...items],
				active: [mid],
				locked: [mid],
				note: `arr[${mid}] = ${target}。旋转没有破坏二分的本质：每一步仍然安全地排除一半区间，仍是 O(log n)`,
			});
			return { title: `旋转数组二分 · 找 ${target}`, frames };
		}
		if (leftSorted) {
			if (values[low]! <= target && target < mv) high = mid - 1;
			else low = mid + 1;
		} else {
			if (mv < target && target <= values[high]!) low = mid + 1;
			else high = mid - 1;
		}
	}
	frames.push({ items: [...items], note: `low > high，区间为空，${target} 不在数组中` });
	return { title: `旋转数组二分 · 找 ${target}`, frames };
}

/** 笔记中可通过 <AlgorithmVizIsland demo="..." /> 引用的演示注册表 */
export const vizDemos: Record<string, VizConfig> = {
	'bubble-sort': bubbleSortDemo(),
	'quick-sort': quickSortDemo(),
	'binary-search': binarySearchDemo(),
	'insertion-sort': insertionSortDemo(),
	'selection-sort': selectionSortDemo(),
	'merge-sort': mergeSortDemo(),
	'heap-sort': heapSortDemo(),
	'two-pointers': twoPointersDemo(),
	'sliding-window': slidingWindowDemo(),
	'shell-sort': shellSortDemo(),
	'counting-sort': countingSortDemo(),
	'three-way-partition': threeWayPartitionDemo(),
	'quickselect': quickSelectDemo(),
	'rotated-binary-search': rotatedBinarySearchDemo(),
};
