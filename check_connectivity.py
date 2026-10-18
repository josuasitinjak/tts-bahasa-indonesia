import json

with open("tts_data.json", encoding="utf-8") as f:
    data = json.load(f)

# Build grid mapping
cells = {} # (r, c) -> list of word_nums
for w in data["across"]:
    for i in range(w["length"]):
        cells.setdefault((w["row"], w["col"] + i), []).append(w["num"])

for w in data["down"]:
    for i in range(w["length"]):
        cells.setdefault((w["row"] + i, w["col"]), []).append(w["num"])

# Graph of word connections
adj = {i: set() for i in range(1, 21)}
for pos, words in cells.items():
    if len(words) > 1:
        for w1 in words:
            for w2 in words:
                if w1 != w2:
                    adj[w1].add(w2)
                    adj[w2].add(w1)

# BFS connectivity
visited = set()
def bfs(start):
    queue = [start]
    visited.add(start)
    while queue:
        curr = queue.pop(0)
        for nxt in adj[curr]:
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)

bfs(1)
print("Connected words from 1:", sorted(list(visited)))
unconnected = set(range(1, 21)) - visited
print("Unconnected words:", sorted(list(unconnected)))

for w in range(1, 21):
    print(f"Word {w} intersects with: {sorted(list(adj[w]))}")
