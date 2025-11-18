import './style.css'
import Swal from 'sweetalert2'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="page">
    <form id="gform" class="gform">
      <header class="form-header">
        <h1 class="title">Google Form 설문 제출</h1>
        <p class="subtitle">
          세 가지 영역을 순서대로 채운 뒤 한 번에 Google Form으로 제출합니다.
        </p>
      </header>

      <div class="form-grid">
        <!-- 1. 학번, 이름, 하고 싶은 말 -->
        <section class="form-card">
        <h2 class="section-title">1. 기본 정보</h2>
        <p class="section-desc">학번과 이름, 하고 싶은 말을 간단히 적어 주세요.</p>

        <div class="field">
          <label for="studentId">학번</label>
          <input
            id="studentId"
            name="entry.2146152790"
            type="text"
            required
            placeholder="예: 20250001"
          />
        </div>

        <div class="field">
          <label for="name">이름</label>
          <input
            id="name"
            name="entry.588671707"
            type="text"
            required
            placeholder="이름을 입력하세요"
          />
        </div>

        <div class="field">
          <label for="message">하고 싶은 말</label>
          <textarea
            id="message"
            name="entry.1047106300"
            rows="4"
            placeholder="자유롭게 입력하세요"
          ></textarea>
        </div>
        </section>

        <!-- 2. 오늘 수학 공부에 대해 챗봇과 대화 나누는 칸 -->
        <section class="form-card">
        <h2 class="section-title">2. 오늘 수학 공부 기록 대화</h2>
        <p class="section-desc">
          GPT API 키(<code>VITE_OPENAI_API_KEY</code>)를 <code>.env</code>에 저장한 뒤,
          이 영역에서 <strong>오늘 수학 공부</strong>에 대해 친절한 수학 선생님과
          대화를 나누고, 그 내용을 그대로 Google Form에 보낼 수 있습니다.
        </p>

        <div class="chat-panel">
          <div id="chatMessages" class="chat-messages" aria-live="polite"></div>

          <div class="chat-input-row">
            <input
              id="chatInput"
              type="text"
              class="chat-input"
              placeholder="오늘 수학 공부는 어떻게 했는지 선생님께 알려주세요"
              autocomplete="off"
            />
            <button type="button" id="chatSend" class="chat-send-btn">
              전송
            </button>
          </div>
          <p id="chatHelper" class="chat-helper">엔터 또는 전송 버튼으로 메시지를 보낼 수 있습니다.</p>
        </div>

        <div class="field">
          <label for="chatConversation">
            오늘 수학 공부 기록 대화 내용
            <span class="label-sub">(entry.145326231)</span>
            <span class="label-sub">자동 기록</span>
          </label>
          <textarea
            id="chatConversation"
            name="entry.145326231"
            rows="6"
            placeholder="수학 선생님 챗봇과 대화하면 이곳에 자동으로 기록됩니다."
            readonly
          ></textarea>
        </div>
        </section>

        <!-- 3. 피드백을 받는 칸 -->
        <section class="form-card">
        <h2 class="section-title">3. 대화 기반 학습 피드백</h2>
        <p class="section-desc">
          2번 칸에서 나눈 수학 공부 대화를 바탕으로 GPT가 학습 상황을 정리하고,
          다음 학습에 도움이 되는 <strong>학습 피드백</strong>을 제공합니다.
        </p>

        <div class="field">
          <button type="button" id="getFeedbackBtn" class="chat-send-btn">
            피드백 받기
          </button>
        </div>

        <div class="field">
          <label for="feedbackSummary">
            챗봇 대화를 바탕으로 한 수학 공부 종합 피드백
            <span class="label-sub">(entry.1300312617 · Google Form 제출용)</span>
          </label>
          <textarea
            id="feedbackSummary"
            name="entry.1300312617"
            rows="6"
            placeholder="2번 칸에서 수학 공부 기록을 충분히 대화한 뒤, '피드백 받기' 버튼을 눌러주세요."
            readonly
          ></textarea>
        </div>
        </section>
      </div>

      <div class="submit-row">
        <button type="submit" class="submit-btn">Google Form으로 제출하기</button>
        <p id="status" class="status" aria-live="polite"></p>
      </div>
    </form>
  </main>
`

const form = document.querySelector('#gform')
const statusEl = document.querySelector('#status')
const chatMessagesEl = document.querySelector('#chatMessages')
const chatInputEl = document.querySelector('#chatInput')
const chatSendBtn = document.querySelector('#chatSend')
const chatHelperEl = document.querySelector('#chatHelper')
const chatTranscriptField = document.querySelector('#chatConversation')
const feedbackBtn = document.querySelector('#getFeedbackBtn')
const feedbackField = document.querySelector('#feedbackSummary')

const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSfKAUd21zYOt-7oIGsK0N_PFKMI6wevFg5IhVKruJZdwUqXNA/formResponse'

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  statusEl.textContent = '제출 중입니다...'

  const formData = new FormData(form)
  const params = new URLSearchParams()

  for (const [key, value] of formData.entries()) {
    params.append(key, value)
  }

  try {
    await fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: params.toString(),
    })

    // no-cors 모드이므로 성공 여부를 정확히 알 수는 없지만,
    // 에러가 발생하지 않았다면 성공했다고 가정합니다.
    statusEl.textContent = '제출이 완료되었습니다. 감사합니다!'
    await Swal.fire({
      title: '제출이 완료되었어요',
      text: '입력한 내용이 Google Form으로 전송되었습니다.',
      icon: 'success',
      confirmButtonText: '확인',
      confirmButtonColor: '#111',
      heightAuto: false,
    })
    form.reset()
  } catch (error) {
    console.error(error)
    statusEl.textContent =
      '제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    Swal.fire({
      title: '제출 실패',
      text: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      icon: 'error',
      confirmButtonText: '확인',
      confirmButtonColor: '#c0392b',
      heightAuto: false,
    })
  }
})

const conversation = []
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const appendMessage = (role, content) => {
  conversation.push({ role, content })

  const messageEl = document.createElement('div')
  messageEl.className = `chat-message chat-message--${role}`
  messageEl.innerHTML = `
    <span class="chat-message__role">${role === 'user' ? '사용자' : '챗봇'}</span>
    <div class="chat-message__bubble">${content.replace(/\n/g, '<br/>')}</div>
  `
  chatMessagesEl.appendChild(messageEl)
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight

  chatTranscriptField.value = conversation
    .map((msg) => `${msg.role === 'user' ? '사용자' : '챗봇'}: ${msg.content}`)
    .join('\n')
}

const setChatState = (isLoading) => {
  chatSendBtn.disabled = isLoading
  chatInputEl.disabled = isLoading
  chatSendBtn.textContent = isLoading ? '답변 생성 중...' : '전송'

  if (isLoading) {
    chatHelperEl.textContent = 'GPT가 응답을 생성하고 있습니다...'
  } else {
    chatHelperEl.textContent = '엔터 또는 전송 버튼으로 메시지를 보낼 수 있습니다.'
  }
}

const callChatbot = async () => {
  if (!OPENAI_API_KEY) {
    appendMessage(
      'assistant',
      'GPT API 키가 설정되어 있지 않습니다. .env 파일에 VITE_OPENAI_API_KEY를 추가해주세요.'
    )
    return
  }

  const payload = {
    model: 'gpt-4o-mini',
    max_tokens: 250,
    messages: [
      {
        role: 'system',
        content:
          '너는 친절하고 이해심 많은 수학 선생님 챗봇이야. 학생이 오늘 어떤 수학 공부를 했는지 묻고, 개념 이해를 점검하며, 필요한 경우 추가 설명이나 연습 아이디어를 제안해. 답변은 한국어로 따뜻하되 2~3문장 이내로 간결하게 하고, 꼭 필요한 질문만 던져.',
      },
      ...conversation.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ],
    temperature: 0.7,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('GPT 응답을 가져오지 못했습니다.')
  }

  const data = await response.json()
  const assistantMessage = data?.choices?.[0]?.message?.content?.trim()

  if (!assistantMessage) {
    throw new Error('GPT 응답이 비어 있습니다.')
  }

  appendMessage('assistant', assistantMessage)
}

const handleSendMessage = async () => {
  const userMessage = chatInputEl.value.trim()
  if (!userMessage) return

  appendMessage('user', userMessage)
  chatInputEl.value = ''

  try {
    setChatState(true)
    await callChatbot()
  } catch (error) {
    console.error(error)
    appendMessage(
      'assistant',
      '답변을 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
    )
  } finally {
    setChatState(false)
    chatInputEl.focus()
  }
}

chatSendBtn.addEventListener('click', handleSendMessage)
chatInputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
})

const setFeedbackState = (isLoading) => {
  feedbackBtn.disabled = isLoading
  feedbackBtn.textContent = isLoading ? '피드백 생성 중...' : '피드백 받기'
}

const generateFeedback = async () => {
  if (!OPENAI_API_KEY) {
    feedbackField.value =
      'GPT API 키가 설정되어 있지 않습니다. .env 파일에 VITE_OPENAI_API_KEY를 추가해주세요.'
    return
  }

  if (conversation.length === 0) {
    feedbackField.value =
      '먼저 2번 칸에서 챗봇과 오늘 기분에 대해 몇 마디 나눈 뒤 다시 시도해주세요.'
    return
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          '너는 학생의 수학 공부를 코칭하는 선생님이야. 학생이 오늘 수학 공부에 대해 챗봇과 나눈 대화를 모두 읽고, (1) 어떤 개념/문제를 다뤘는지와 이해 상태를 요약하고, (2) 칭찬과 격려를 건네고, (3) 다음 학습에 도움이 될 만한 2~3가지 구체적 제안을 한국어로 3~4단락 이내로 정리해 줘.',
      },
      ...conversation.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ],
    temperature: 0.7,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('GPT 피드백을 가져오지 못했습니다.')
  }

  const data = await response.json()
  const feedback = data?.choices?.[0]?.message?.content?.trim()

  if (!feedback) {
    throw new Error('GPT 피드백이 비어 있습니다.')
  }

  feedbackField.value = feedback
}

feedbackBtn.addEventListener('click', async () => {
  try {
    setFeedbackState(true)
    feedbackField.value = '피드백을 생성하고 있습니다. 잠시만 기다려주세요...'
    await generateFeedback()
  } catch (error) {
    console.error(error)
    feedbackField.value =
      '피드백을 생성하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    setFeedbackState(false)
  }
})
