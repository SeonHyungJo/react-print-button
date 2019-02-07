import React from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'

class ReactToPrint extends React.Component {
  // 인쇄 취소
  removeWindow = (target) => {
    target.parentNode.removeChild(target)
  };

  // 인쇄 버튼 클릭시
  triggerPrint = (target) => {
    const { onBeforePrint, onAfterPrint } = this.props

    if (onBeforePrint) {
      onBeforePrint()
    }

    // target.contentWindow.focus();
    /* 인쇄창 띄우기 */
    target.contentWindow.print()

    /* 취소를 누를 경우 */
    this.removeWindow(target)

    if (onAfterPrint) {
      onAfterPrint()
    }
  };

  // 인쇄 화면 초기화
  handlePrint = () => {
    const {
      content, copyStyles, pageStyle
    } = this.props

    // ref : Dom에 직접 접근
    const contentEl = content()

    if (contentEl === undefined) {
      console.error(
        'stateless components에서는 Ref를 사용할 수 없습니다. 클래스 기반 컴포넌트에서만 프린트가 가능합니다.'
      )
      return
    }

    /**
     * 전체적인 흐름
     * iframe을 만든다.
     * iframe내부에 ref로 Dom에 직접접근을 하여 화면 소스를 iframe으로 옮긴다.
     * Css Link 같은 head 파일들도 옮긴다.
     */

    // iframe을 생성한다.
    const printWindow = document.createElement('iframe')

    // iframe을 사용하는 이유에 대해서 명시를 할 필요가 있음
    printWindow.style.position = 'absolute'
    printWindow.style.top = '-1000px'
    printWindow.style.left = '-1000px'

    // DomNode를 찾아서 가져옴
    const contentNodes = findDOMNode(contentEl)
    // 관련 CSS들을 가져옴
    const linkNodes = document.querySelectorAll('link[rel="stylesheet"]')

    this.linkTotal = linkNodes.length || 0
    this.linksLoaded = []
    this.linksErrored = []

    // CSS 로딩해서 로딩된 것과 실패한 것을 구분하는 부분
    const markLoaded = (linkNode, loaded) => {
      loaded ? this.linksLoaded.push(linkNode) : this.linksErrored.push(linkNode)

      this.linksLoaded.length + this.linksErrored.length === this.linkTotal && this.triggerPrint(printWindow)
    }

    // iframe이 onload되는 시점. 즉 다 그려진 시점이라고 생각하면 될 듯
    printWindow.onload = () => {
      /* IE11 support */
      if (window.navigator && window.navigator.userAgent.indexOf('Trident/7.0') > -1) {
        printWindow.onload = null
      }

      // iframe내부 Dom을 가져옴
      const domDoc = printWindow.contentDocument || printWindow.contentWindow.document
      domDoc.open()
      // ref 참조한 것을 그림
      // outerHTML : Element를 String으로 뽑아내줌
      domDoc.write(contentNodes.outerHTML)
      domDoc.close()
      // iframe에 ref Element를 그려넣음

      /* remove date/time from top <= 안먹음 */
      // Default Style margin 수정진행
      const defaultPageStyle = pageStyle === undefined
        ? '@page { size: auto;  margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; } }'
        : pageStyle

      const styleEl = domDoc.createElement('style')

      // 동적으로 TextNode추가
      // 즉 style Elemnt에 자식으로 defaultPageStyle 추가
      /**
        *<style>
        * @page { size: auto;  margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; } }
        *</style>
        */
      styleEl.appendChild(domDoc.createTextNode(defaultPageStyle))

      // 만든 style Element를 Head에 추가
      domDoc.head.appendChild(styleEl)

      if (copyStyles !== false) {
        const headEls = document.querySelectorAll('style, link[rel="stylesheet"]')
        console.log(headEls);

        [...headEls].forEach((node, index) => {
          if (node.tagName === 'STYLE') {
            // <style></style> 생성
            const newHeadEl = domDoc.createElement(node.tagName)

            if (node.sheet) {
              let styleCSS = ''

              for (let i = 0; i < node.sheet.cssRules.length; i++) {
                // String으로 변환
                styleCSS += `${node.sheet.cssRules[i].cssText}\r\n`
              }

              newHeadEl.setAttribute('id', `react-print-${index}`)
              newHeadEl.appendChild(domDoc.createTextNode(styleCSS))
              // 헤더에 추가
              domDoc.head.appendChild(newHeadEl)
            }
          } else {
            const attributes = [...node.attributes]
            const hrefAttr = attributes.filter(attr => attr.nodeName === 'href')
            const hasHref = hrefAttr.length ? !!hrefAttr[0].nodeValue : false

            if (hasHref) {
              const newHeadEl = domDoc.createElement(node.tagName)

              attributes.forEach((attr) => {
                newHeadEl.setAttribute(attr.nodeName, attr.nodeValue)
              })

              newHeadEl.onload = markLoaded.bind(null, newHeadEl, true)
              newHeadEl.onerror = markLoaded.bind(null, newHeadEl, false)

              domDoc.head.appendChild(newHeadEl)
            } else {
              markLoaded(node, true)
            }
          }
        })
      }

      if (this.linkTotal === 0 || copyStyles === false) {
        this.triggerPrint(printWindow)
      }
    }

    document.body.appendChild(printWindow)
  };

  setRef = (ref) => {
    this.triggerRef = ref
  };

  render () {
    const { trigger } = this.props

    return React.cloneElement(trigger(), {
      onClick: this.handlePrint,
      ref: this.setRef
    })
  }
}

ReactToPrint.propTypes = {
  trigger: PropTypes.func.isRequired,
  content: PropTypes.func.isRequired,
  copyStyles: PropTypes.bool,
  onBeforePrint: PropTypes.func,
  onAfterPrint: PropTypes.func,
  pageStyle: PropTypes.string
}

ReactToPrint.defaultProps = {
  copyStyles: true,
  onAfterPrint: undefined,
  onBeforePrint: undefined,
  pageStyle: undefined
}

export default ReactToPrint
