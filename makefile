-INIT_DIRS := out out/release
PWD := `pwd`

clean:
	@echo 'clean'
	@rm -rf $(-INIT_DIRS)
	@mkdir -p $(-INIT_DIRS)

start:
	npm run dev

install:
	npm install --registry=https://registry.npm.taobao.org

-common-pre: clean

release: -common-pre
	@echo 'make release begin'
	@npm run build
	@rsync -av . ./out/release --exclude-from .rsyncignore
	cp ./out/release/etc/config.${env}.yaml ./out/release/etc/config.yaml
	@echo 'make release done'

build: release
	docker build -t ${name} .

publish: build
	docker tag ${name} registry.cn-hangzhou.aliyuncs.com/citybrain/${name}:latest
	docker push registry.cn-hangzhou.aliyuncs.com/citybrain/${name}