with open('G:/My Drive/AntiGravity/VAST/index.html', encoding='utf-8') as f:
    content = f.read()
panels = [f'id="panel-{i}"' in content for i in range(1,11)]
print('Panels found:', panels)
print('Total panels:', sum(panels))
print('Has sidebar:', 'class="sidebar"' in content)
print('Has global-toolbar:', 'class="global-toolbar"' in content)
print('Has modals:', 'modal-catalog' in content and 'modal-config' in content and 'modal-onboarding' in content)
print('Has checkpoints panel:', 'checkpoints-panel' in content)
print('Has actions-bar:', 'class="actions-bar"' in content)
print('File size:', len(content), 'chars')
print('Lines:', content.count('\n'))
