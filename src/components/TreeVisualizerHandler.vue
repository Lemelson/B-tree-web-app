<template>
  <div
    id="tree-visualizer-handler"
    class="tree-page"
  >
    <v-container
      fluid
      class="py-6 tree-container"
    >
      <v-row dense>
        <v-col
          cols="12"
          md="4"
          lg="3"
        >
          <v-card
            class="control-card pa-4"
            elevation="2"
          >
            <div class="d-flex justify-space-between align-center mb-4 control-card__header">
              <div>
                <h2 class="text-h5 font-weight-semibold mb-1">
                  {{ title }}
                </h2>
                <p class="mb-0 text-body-2 grey--text text--darken-1">
                  Интерактивный конструктор B-дерева.
                </p>
              </div>
              <v-chip
                color="primary"
                text-color="white"
                label
                small
              >
                Порядок {{ treeOrder }}
              </v-chip>
            </div>

            <v-divider class="my-4" />

            <section>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">
                Параметры
              </h3>
              <v-slider
                v-model="treeOrder"
                class="mb-4"
                color="primary"
                :min="2"
                :max="6"
                :step="1"
                thumb-label
                :disabled="isAnimating"
                @change="handleTreeOrderChange"
              >
                <template #label>
                  <span class="caption text-uppercase">Порядок дерева</span>
                </template>
              </v-slider>
              <v-slider
                v-model="animationSpeed"
                class="mb-2"
                color="primary"
                :min="150"
                :max="1500"
                :step="50"
                thumb-label
                :disabled="isAnimating"
              >
                <template #label>
                  <span class="caption text-uppercase">Скорость анимации (мс)</span>
                </template>
              </v-slider>
              <small class="d-block caption grey--text text--darken-1">
                Меньшее значение — быстрее проигрывание кадров.
              </small>
            </section>

            <v-divider class="my-4" />

            <section>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">
                Операции
              </h3>
              <InsertInput
                class="mb-3"
                :disabled="isAnimating"
                label="Вставка значений"
                hint="Можно вводить несколько чисел через запятую или пробел."
                @myEvent="handleInsert"
              />
              <SearchInput
                class="mb-3"
                :disabled="isAnimating"
                label="Поиск значения"
                hint="Поиск выполняется по одному числу."
                @myEvent="handleSearch"
              />
              <DeleteInput
                :disabled="isAnimating"
                :onlypop="onlypop"
                label="Удаление значения"
                hint="Удаление выполняется по одному числу."
                @myEvent="handleDelete"
              />
            </section>

            <v-divider class="my-4" />

            <section>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">
                Сценарии
              </h3>
              <v-row dense>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model.number="generatorSettings.count"
                    type="number"
                    min="1"
                    label="Количество"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model.number="generatorSettings.min"
                    type="number"
                    label="Мин."
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model.number="generatorSettings.max"
                    type="number"
                    label="Макс."
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
              <div class="action-buttons d-flex flex-wrap mt-2">
                <v-btn
                  color="secondary"
                  class="mr-2"
                  :disabled="isAnimating"
                  @click="generateRandomInsertions"
                >
                  Случайные вставки
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  class="mr-2"
                  :disabled="isAnimating"
                  @click="resetTree({ order: treeOrder })"
                >
                  Сбросить дерево
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  class="mr-2"
                  @click="openImportDialog"
                >
                  Импорт
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="exportTree"
                >
                  Экспорт
                </v-btn>
              </div>
            </section>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="8"
          lg="9"
        >
          <v-card
            class="visualizer-card pa-4"
            elevation="2"
          >
            <div
              class="d-flex justify-space-between align-center flex-wrap visualizer-card__header"
            >
              <div class="mb-2">
                <h2 class="text-h5 font-weight-semibold mb-1">
                  Визуализация
                </h2>
                <p class="mb-0 caption grey--text text--darken-1">
                  Следите за каждым шагом операций и управляйте историей.
                </p>
              </div>
              <div class="stats-chip-group d-flex flex-wrap">
                <div class="stats-chip">
                  <span class="caption grey--text text--darken-1">Высота</span>
                  <span class="text-subtitle-1 font-weight-medium">{{ treeStats.height }}</span>
                </div>
                <div class="stats-chip">
                  <span class="caption grey--text text--darken-1">Узлы</span>
                  <span class="text-subtitle-1 font-weight-medium">{{ treeStats.nodeCount }}</span>
                </div>
                <div class="stats-chip">
                  <span class="caption grey--text text--darken-1">Ключи</span>
                  <span class="text-subtitle-1 font-weight-medium">{{ treeStats.keyCount }}</span>
                </div>
              </div>
            </div>

            <transition name="fade">
              <v-alert
                v-if="feedback.show"
                :type="feedback.type"
                dense
                outlined
                class="mt-4"
                border="left"
                prominent
              >
                {{ feedback.message }}
              </v-alert>
            </transition>

            <Visualizer
              :sequences="sequences"
              :current-sequence-number="currentSequenceNumber"
              :current-frame-number="currentFrame"
              tree-type="b-tree"
            />

            <div class="controls-footer d-flex flex-wrap justify-center align-center mt-4">
              <div class="history-btn-container mb-2 mx-2">
                <HistoryButtons
                  id="history.buttons"
                  :current="currentSequenceNumber"
                  :length="sequences.length"
                  :disabled="historyButtonsAreDisabled"
                  label="История"
                  @HistoryEvents="changeCurrentSequence"
                />
              </div>
              <v-btn
                color="primary"
                class="mx-2 mb-2"
                :disabled="isAnimating || !currentSequence || !currentSequence.frames.length"
                @click="replay"
              >
                Повторить
                <v-icon right>
                  mdi-replay
                </v-icon>
              </v-btn>
              <div class="step-btn-container mb-2 mx-2">
                <HistoryButtons
                  id="step-buttons"
                  :current-frame="currentFrame"
                  :length="currentSequence ? currentSequence.frames.length : 0"
                  :disabled="stepButtonsAreDisabled"
                  label="Анимация"
                  @HistoryEvents="changeCurrentFrame"
                />
              </div>
            </div>
          </v-card>

          <v-card
            class="history-card pa-4 mt-4"
            elevation="2"
          >
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <h3 class="text-subtitle-1 font-weight-medium mb-1">
                  Журнал операций
                </h3>
                <p class="mb-0 caption grey--text text--darken-1">
                  Последние события и результаты.
                </p>
              </div>
              <v-btn
                text
                small
                color="grey darken-1"
                :disabled="!operationHistory.length"
                @click="clearHistory"
              >
                Очистить
              </v-btn>
            </div>
            <v-list
              v-if="operationHistory.length"
              two-line
              dense
              class="history-list"
            >
              <v-list-item
                v-for="item in formattedHistory"
                :key="item.id"
                :class="['history-entry', `history-entry--${item.status}`]"
              >
                <v-list-item-avatar>
                  <v-icon :color="item.color">
                    {{ item.icon }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.subtitle }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action-text>
                  {{ item.time }}
                </v-list-item-action-text>
              </v-list-item>
            </v-list>
            <div
              v-else
              class="py-6 text-center grey--text"
            >
              История пока пуста. Выполните операцию, чтобы увидеть событие.
            </div>
          </v-card>

          <v-card
            class="knowledge-card pa-4 mt-4"
            elevation="1"
          >
            <h3 class="text-subtitle-1 font-weight-medium mb-3">
              Справка по алгоритму
            </h3>
            <v-expansion-panels flat>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Что такое B-дерево?
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <p class="mb-2">
                    B-дерево — сбалансированная структура данных,
                    в которой каждый узел хранит несколько ключей
                    и может иметь несколько потомков.
                    Оно поддерживает упорядоченный набор значений
                    и обеспечивает поиск, вставку и удаление за O(log n).
                  </p>
                  <p class="mb-0">
                    Порядок дерева определяет минимальное и максимальное количество ключей в узле,
                    что влияет на ширину и высоту дерева.
                  </p>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Советы по визуализации
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <ul class="mb-0 pl-4">
                    <li>Используйте историю, чтобы возвращаться к предыдущим операциям.</li>
                    <li>Настраивайте скорость анимации для пошагового разбора алгоритма.</li>
                    <li>Экспортируйте дерево и делитесь сценариями с коллегами или студентами.</li>
                  </ul>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Идеи для экспериментов
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <ul class="mb-0 pl-4">
                    <li>Сравните поведение дерева при разных порядках и наборах данных.</li>
                    <li>Исследуйте удаление, приводящее к слияниям и заимствованию ключей.</li>
                    <li>Импортируйте заранее подготовленные сценарии для демонстраций.</li>
                  </ul>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog
      v-model="importDialog.visible"
      max-width="520"
    >
      <v-card>
        <v-card-title class="headline">
          Импорт дерева
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            Вставьте JSON с массивом значений и опционально параметром <code>order</code>.
          </p>
          <v-textarea
            v-model="importDialog.payload"
            outlined
            rows="6"
            hide-details="auto"
            label='{ "order": 3, "values": [1, 2, 3, 4] }'
          />
          <v-alert
            v-if="importDialog.error"
            type="error"
            dense
            outlined
            class="mt-3"
          >
            {{ importDialog.error }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeImportDialog">
            Отмена
          </v-btn>
          <v-btn color="primary" @click="applyImport">
            Импортировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="exportDialog.visible"
      max-width="520"
    >
      <v-card>
        <v-card-title class="headline">
          Экспорт дерева
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="exportDialog.payload"
            readonly
            outlined
            rows="6"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="exportDialog.visible = false">
            Закрыть
          </v-btn>
          <v-btn color="primary" @click="copyExportPayload">
            Скопировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import InsertInput from './shared/InsertInput.vue';
import SearchInput from './shared/SearchInput.vue';
import DeleteInput from './shared/DeleteInput.vue';
import Visualizer from './shared/Visualizer.vue';
import HistoryButtons from './shared/HistoryButtons.vue';
import Sequence, { Frame } from '../assets/visualizer/frame';
import BTree from '../assets/implementations/btree';

const DEFAULT_ORDER = 3;
const DEFAULT_SPEED = 600;
const MAX_HISTORY = 40;

export default {
  name: 'TreeVisualizerHandler',
  components: {
    InsertInput,
    SearchInput,
    DeleteInput,
    Visualizer,
    HistoryButtons,
  },
  data() {
    return {
      tree: new BTree(DEFAULT_ORDER),
      sequencesList: [],
      insertionQueue: [],
      currentSequenceNumber: 0,
      currentFrame: 0,
      onlypop: false,
      isAnimating: false,
      title: 'B-дерево',
      animationSpeed: DEFAULT_SPEED,
      treeOrder: DEFAULT_ORDER,
      generatorSettings: {
        count: 6,
        min: 0,
        max: 99,
      },
      feedback: {
        show: false,
        message: '',
        type: 'info',
      },
      feedbackTimer: null,
      operationHistory: [],
      treeStats: {
        order: DEFAULT_ORDER,
        height: 1,
        nodeCount: 1,
        keyCount: 0,
      },
      importDialog: {
        visible: false,
        payload: '',
        error: '',
      },
      exportDialog: {
        visible: false,
        payload: '',
      },
    };
  },
  computed: {
    sequences() {
      return this.sequencesList;
    },
    currentSequence() {
      return this.sequencesList[this.currentSequenceNumber] || null;
    },
    stepButtonsAreDisabled() {
      if (!this.currentSequence) {
        return {
          backButtonIsDisabled: true,
          forwardButtonIsDisabled: true,
          isAnimating: this.isAnimating,
        };
      }
      const backButtonIsDisabled = this.currentFrame <= 0;
      const forwardButtonIsDisabled = this.currentFrame >= this.currentSequence.frames.length - 1;
      return {
        backButtonIsDisabled,
        forwardButtonIsDisabled,
        isAnimating: this.isAnimating,
      };
    },
    historyButtonsAreDisabled() {
      const backButtonIsDisabled = this.currentSequenceNumber <= 0;
      const forwardButtonIsDisabled = this.currentSequenceNumber >= this.sequencesList.length - 1;
      return {
        backButtonIsDisabled,
        forwardButtonIsDisabled,
        isAnimating: this.isAnimating,
      };
    },
    formattedHistory() {
      const formatter = new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const iconMap = {
        insert: 'mdi-plus-circle-outline',
        delete: 'mdi-delete-outline',
        search: 'mdi-magnify',
        reset: 'mdi-refresh',
        import: 'mdi-file-import',
        export: 'mdi-content-save-outline',
        random: 'mdi-shuffle-variant',
      };
      const colorMap = {
        success: 'success',
        info: 'primary',
        warning: 'warning',
        error: 'error',
      };
      return this.operationHistory.map((item) => ({
        ...item,
        icon: iconMap[item.type] || 'mdi-information-outline',
        color: colorMap[item.status] || 'primary',
        time: formatter.format(item.timestamp),
      }));
    },
  },
  mounted() {
    this.resetTree({ order: this.treeOrder, notify: false, record: false });
    this.notify('Дерево готово к экспериментам', 'info');
  },
  beforeDestroy() {
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  },
  methods: {
    notify(message, type = 'info') {
      if (this.feedbackTimer) {
        clearTimeout(this.feedbackTimer);
      }
      this.feedback = {
        show: true,
        message,
        type,
      };
      this.feedbackTimer = setTimeout(() => {
        this.feedback.show = false;
      }, 5000);
    },
    updateStats() {
      this.treeStats = this.tree.getStats();
    },
    recordHistory({
      type = 'info', status = 'info', title = '', subtitle = '',
    }) {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date(),
        type,
        status,
        title,
        subtitle,
      };
      this.operationHistory = [entry, ...this.operationHistory].slice(0, MAX_HISTORY);
      return entry;
    },
    clearHistory() {
      this.operationHistory = [];
    },
    resetTree({
      order = this.treeOrder, notify = true, record = true, message,
    } = {}) {
      const normalizedOrder = Number(order);
      if (!Number.isInteger(normalizedOrder) || normalizedOrder < 2) {
        this.notify('Порядок дерева должен быть целым числом не меньше двух.', 'error');
        this.treeOrder = this.tree.order;
        return;
      }
      this.tree.reset(normalizedOrder);
      this.treeOrder = normalizedOrder;
      this.insertionQueue = [];
      this.currentSequenceNumber = 0;
      this.currentFrame = 0;
      this.isAnimating = false;
      this.onlypop = false;
      this.sequencesList = [];
      this.captureSnapshot();
      this.updateStats();
      const info = message || `Дерево очищено. Текущий порядок: ${normalizedOrder}`;
      if (notify) {
        this.notify(info, 'info');
      }
      if (record) {
        this.recordHistory({
          type: 'reset',
          status: 'info',
          title: 'Сброс дерева',
          subtitle: info,
        });
      }
    },
    captureSnapshot() {
      const snapshot = new Sequence();
      snapshot.addFrame(new Frame(this.tree.toJSON(this.tree.root)));
      this.sequencesList.push(snapshot);
      this.currentSequenceNumber = this.sequencesList.length - 1;
      this.currentFrame = snapshot.frames.length - 1;
      this.sequencesList = [...this.sequencesList];
    },
    addSequenceAsync(sequence, { onComplete } = {}) {
      const frames = sequence && Array.isArray(sequence.frames) ? sequence.frames : [];
      if (!this.currentSequence) {
        if (onComplete) {
          onComplete();
        }
        return;
      }
      if (!frames.length) {
        this.isAnimating = false;
        this.$set(this.currentSequence, 'frames', []);
        this.currentFrame = 0;
        if (onComplete) {
          onComplete();
        }
        return;
      }
      this.isAnimating = true;
      this.$set(this.currentSequence, 'frames', []);
      this.currentSequence.addFrame(frames[0]);
      this.currentFrame = 0;

      const playFrame = (index) => {
        if (index >= frames.length) {
          this.isAnimating = false;
          if (onComplete) {
            onComplete();
          }
          return;
        }
        setTimeout(() => {
          if (!this.currentSequence) {
            this.isAnimating = false;
            if (onComplete) {
              onComplete();
            }
            return;
          }
          this.currentSequence.addFrame(frames[index]);
          this.currentFrame = index;
          this.sequencesList = [...this.sequencesList];
          playFrame(index + 1);
        }, this.animationSpeed);
      };

      playFrame(1);
    },
    changeCurrentFrame(step) {
      if (!this.currentSequence) {
        return;
      }
      this.currentFrame += step;
      if (this.currentFrame < 0) {
        this.currentFrame = 0;
      }
      const maxFrame = this.currentSequence.frames.length - 1;
      if (this.currentFrame > maxFrame) {
        this.currentFrame = maxFrame;
      }
    },
    changeCurrentSequence(step) {
      if (!this.sequencesList.length) {
        return;
      }
      const next = this.currentSequenceNumber + step;
      this.currentSequenceNumber = Math.min(Math.max(next, 0), this.sequencesList.length - 1);
      const sequence = this.currentSequence;
      this.currentFrame = sequence ? sequence.frames.length - 1 : 0;
    },
    replay() {
      if (!this.currentSequence || !this.currentSequence.frames.length || this.isAnimating) {
        return;
      }
      const frames = this.currentSequence.frames.map((frame) => frame);
      const sequence = { frames };
      this.addSequenceAsync(sequence);
    },
    handleTreeOrderChange(order) {
      if (this.isAnimating) {
        this.notify('Дождитесь завершения анимации перед изменением порядка.', 'warning');
        this.treeOrder = this.tree.order;
        return;
      }
      this.resetTree({
        order,
        message: `Порядок дерева изменён на ${order}.`,
      });
    },
    parseValues(input) {
      if (input === undefined || input === null) {
        return { values: [], invalid: [] };
      }
      const rawValues = String(input)
        .split(/[\s,;]+/)
        .map((value) => value.trim())
        .filter((value) => value !== '');
      const values = [];
      const invalid = [];
      rawValues.forEach((value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || !Number.isInteger(numeric)) {
          invalid.push(value);
        } else {
          values.push(numeric);
        }
      });
      return { values, invalid };
    },
    parseSingleValue(input) {
      if (input === undefined || input === null) {
        return { error: 'Введите целое число.' };
      }
      const trimmed = String(input).trim();
      if (!trimmed) {
        return { error: 'Введите целое число.' };
      }
      const numeric = Number(trimmed);
      if (!Number.isFinite(numeric) || !Number.isInteger(numeric)) {
        return { error: `Значение "${trimmed}" не является целым числом.` };
      }
      return { value: numeric };
    },
    filterInsertableValues(values) {
      const uniqueValues = [];
      const duplicates = [];
      const existing = [];
      const seen = new Set();
      values.forEach((value) => {
        if (seen.has(value)) {
          duplicates.push(value);
          return;
        }
        if (this.tree.contains(value)) {
          existing.push(value);
          return;
        }
        seen.add(value);
        uniqueValues.push(value);
      });
      return { uniqueValues, duplicates, existing };
    },
    handleInsert(raw) {
      if (this.isAnimating) {
        this.notify('Дождитесь завершения текущей анимации перед добавлением новых значений.', 'warning');
        return;
      }
      const { values, invalid } = this.parseValues(raw);
      if (!values.length && !invalid.length) {
        this.notify('Введите хотя бы одно целое число.', 'error');
        return;
      }
      const { uniqueValues, duplicates, existing } = this.filterInsertableValues(values);
      if (!uniqueValues.length) {
        const parts = [];
        if (duplicates.length) {
          parts.push(`дубликаты: ${duplicates.join(', ')}`);
        }
        if (existing.length) {
          parts.push(`уже в дереве: ${existing.join(', ')}`);
        }
        if (invalid.length) {
          parts.push(`игнорированы значения: ${invalid.join(', ')}`);
        }
        const message = parts.length ? `Не удалось добавить значения (${parts.join('; ')}).` : 'Все значения уже присутствуют в дереве.';
        this.notify(message, 'warning');
        this.recordHistory({
          type: 'insert',
          status: 'warning',
          title: 'Вставка пропущена',
          subtitle: message,
        });
        return;
      }
      this.insertionQueue.push(...uniqueValues);
      this.notify(`Добавлено в очередь: ${uniqueValues.join(', ')}`, 'info');
      if (invalid.length || duplicates.length || existing.length) {
        const messageParts = [];
        if (invalid.length) {
          messageParts.push(`игнорированы: ${invalid.join(', ')}`);
        }
        if (duplicates.length) {
          messageParts.push(`дубликаты: ${duplicates.join(', ')}`);
        }
        if (existing.length) {
          messageParts.push(`уже в дереве: ${existing.join(', ')}`);
        }
        this.recordHistory({
          type: 'insert',
          status: 'warning',
          title: 'Фильтрация значений',
          subtitle: messageParts.join('; '),
        });
      }
      if (!this.isAnimating) {
        this.dequeueInsert();
      }
    },
    dequeueInsert() {
      if (!this.insertionQueue.length) {
        return;
      }
      const value = this.insertionQueue.shift();
      const placeholder = new Sequence();
      this.sequencesList.push(placeholder);
      this.currentSequenceNumber = this.sequencesList.length - 1;
      this.currentFrame = 0;
      this.sequencesList = [...this.sequencesList];
      const sequence = this.tree.insert(value);
      this.addSequenceAsync(sequence, {
        onComplete: () => {
          this.updateStats();
          this.recordHistory({
            type: 'insert',
            status: 'success',
            title: `Вставка ${value}`,
            subtitle: `Значение ${value} добавлено в дерево`,
          });
          if (this.insertionQueue.length) {
            this.dequeueInsert();
          }
        },
      });
    },
    handleSearch(raw) {
      if (this.isAnimating) {
        this.notify('Дождитесь завершения анимации перед выполнением поиска.', 'warning');
        return;
      }
      const { value, error } = this.parseSingleValue(raw);
      if (error) {
        this.notify(error, 'error');
        this.recordHistory({
          type: 'search',
          status: 'error',
          title: 'Поиск не выполнен',
          subtitle: error,
        });
        return;
      }
      const { sequence, node } = this.tree.searchValue(value);
      const placeholder = new Sequence();
      this.sequencesList.push(placeholder);
      this.currentSequenceNumber = this.sequencesList.length - 1;
      this.currentFrame = 0;
      this.sequencesList = [...this.sequencesList];
      this.addSequenceAsync(sequence, {
        onComplete: () => {
          const status = node ? 'success' : 'warning';
          const message = node ? `Значение ${value} найдено.` : `Значение ${value} не найдено.`;
          this.notify(message, status === 'success' ? 'success' : 'warning');
          this.recordHistory({
            type: 'search',
            status,
            title: `Поиск ${value}`,
            subtitle: message,
          });
        },
      });
    },
    handleDelete(raw) {
      if (this.isAnimating) {
        this.notify('Дождитесь завершения анимации перед удалением.', 'warning');
        return;
      }
      const { value, error } = this.parseSingleValue(raw);
      if (error) {
        this.notify(error, 'error');
        this.recordHistory({
          type: 'delete',
          status: 'error',
          title: 'Удаление не выполнено',
          subtitle: error,
        });
        return;
      }
      if (!this.tree.contains(value)) {
        const message = `Значение ${value} отсутствует в дереве.`;
        this.notify(message, 'warning');
        this.recordHistory({
          type: 'delete',
          status: 'warning',
          title: `Удаление ${value}`,
          subtitle: message,
        });
        return;
      }
      const placeholder = new Sequence();
      this.sequencesList.push(placeholder);
      this.currentSequenceNumber = this.sequencesList.length - 1;
      this.currentFrame = 0;
      this.sequencesList = [...this.sequencesList];
      const sequence = this.tree.delete(value);
      this.addSequenceAsync(sequence, {
        onComplete: () => {
          this.updateStats();
          const message = `Значение ${value} удалено.`;
          this.notify(message, 'success');
          this.recordHistory({
            type: 'delete',
            status: 'success',
            title: `Удаление ${value}`,
            subtitle: message,
          });
        },
      });
    },
    generateRandomInsertions() {
      if (this.isAnimating) {
        this.notify('Дождитесь завершения текущей анимации перед генерацией данных.', 'warning');
        return;
      }
      let { count, min, max } = this.generatorSettings;
      count = Number.isInteger(count) ? count : 0;
      min = Number.isInteger(min) ? min : 0;
      max = Number.isInteger(max) ? max : 0;
      if (max < min) {
        [min, max] = [max, min];
      }
      const range = max - min + 1;
      if (range <= 0) {
        this.notify('Диапазон должен содержать хотя бы одно значение.', 'error');
        return;
      }
      const safeCount = Math.min(Math.max(count, 1), Math.min(range, 25));
      const generated = new Set();
      while (generated.size < safeCount && generated.size < range) {
        const value = Math.floor(Math.random() * range) + min;
        generated.add(value);
      }
      const values = Array.from(generated);
      const { uniqueValues, existing } = this.filterInsertableValues(values);
      if (!uniqueValues.length) {
        this.notify('Все сгенерированные значения уже присутствуют в дереве.', 'warning');
        this.recordHistory({
          type: 'random',
          status: 'warning',
          title: 'Случайные вставки',
          subtitle: 'Дерево уже содержит все сгенерированные значения.',
        });
        return;
      }
      this.insertionQueue.push(...uniqueValues);
      this.notify(`Сгенерированы значения: ${uniqueValues.join(', ')}`, 'info');
      this.recordHistory({
        type: 'random',
        status: 'info',
        title: 'Сгенерирована последовательность',
        subtitle: `Будет вставлено ${uniqueValues.length} значений`,
      });
      if (existing.length) {
        this.recordHistory({
          type: 'random',
          status: 'warning',
          title: 'Пропущенные значения',
          subtitle: `В дереве уже были: ${existing.join(', ')}`,
        });
      }
      if (!this.isAnimating) {
        this.dequeueInsert();
      }
    },
    openImportDialog() {
      this.importDialog.visible = true;
      this.importDialog.payload = JSON.stringify({
        order: this.treeOrder,
        values: this.tree.toSortedArray(),
      }, null, 2);
      this.importDialog.error = '';
    },
    closeImportDialog() {
      this.importDialog.visible = false;
      this.importDialog.payload = '';
      this.importDialog.error = '';
    },
    applyImport() {
      try {
        const payload = JSON.parse(this.importDialog.payload || '[]');
        const order = Number.isInteger(payload.order) ? payload.order : this.treeOrder;
        const rawValues = Array.isArray(payload.values) ? payload.values : [];
        const prepared = rawValues
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && Number.isInteger(value));
        const uniqueValues = Array.from(new Set(prepared));
        this.resetTree({ order, notify: false, record: false });
        uniqueValues.forEach((value) => {
          this.tree.insert(value);
        });
        this.captureSnapshot();
        this.updateStats();
        this.notify(`Импортировано ${uniqueValues.length} значений.`, 'success');
        this.recordHistory({
          type: 'import',
          status: 'success',
          title: 'Импорт данных',
          subtitle: `Загружено ${uniqueValues.length} значений, порядок ${order}.`,
        });
        this.closeImportDialog();
      } catch (error) {
        this.importDialog.error = 'Не удалось прочитать JSON. Проверьте синтаксис.';
      }
    },
    exportTree() {
      this.exportDialog.payload = JSON.stringify({
        order: this.treeOrder,
        values: this.tree.toSortedArray(),
      }, null, 2);
      this.exportDialog.visible = true;
      this.recordHistory({
        type: 'export',
        status: 'info',
        title: 'Экспорт дерева',
        subtitle: `Экспортировано ${this.treeStats.keyCount} ключей`,
      });
    },
    copyExportPayload() {
      if (!this.exportDialog.payload) {
        return;
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.exportDialog.payload)
          .then(() => {
            this.notify('JSON скопирован в буфер обмена.', 'success');
          })
          .catch(() => {
            this.notify('Не удалось скопировать автоматически. Скопируйте вручную.', 'warning');
          });
      } else {
        this.notify('Скопируйте содержимое вручную.', 'warning');
      }
    },
  },
};
</script>

<style scoped>
.tree-page {
  min-height: calc(100vh - 80px);
  background: linear-gradient(180deg, #f5f7fb 0%, #ffffff 100%);
}

.tree-container {
  max-width: 1400px;
}

.control-card,
.visualizer-card,
.history-card {
  border-radius: 18px;
  background-color: #ffffff;
}

.knowledge-card {
  border-radius: 18px;
  background: #f8fafc;
}

.control-card__header h2 {
  letter-spacing: 0.02em;
}

.stats-chip-group {
  gap: 16px;
}

.stats-chip {
  background: rgba(59, 130, 246, 0.08);
  border-radius: 12px;
  padding: 8px 14px;
  margin-bottom: 8px;
  min-width: 84px;
  text-align: center;
}

.action-buttons > * {
  margin-right: 12px;
  margin-bottom: 10px;
}

.action-buttons > *:last-child {
  margin-right: 0;
}

.controls-footer {
  border-top: 1px solid #eef1f6;
  padding-top: 16px;
}

.history-list {
  max-height: 260px;
  overflow-y: auto;
}

.history-entry {
  border-radius: 12px;
  margin-bottom: 6px;
  padding-left: 8px;
}

.history-entry--success {
  border-left: 4px solid #4caf50;
}

.history-entry--info {
  border-left: 4px solid #2196f3;
}

.history-entry--warning {
  border-left: 4px solid #fb8c00;
}

.history-entry--error {
  border-left: 4px solid #e53935;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

::v-deep(.view-container) {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 16px;
}

::v-deep(.svg) {
  min-height: 320px;
}

::v-deep(.link) {
  stroke-linecap: round;
}

::v-deep(.node text) {
  font-weight: 600;
  fill: #0f172a;
}
</style>
